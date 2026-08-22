const express = require("express");
const Stripe = require("stripe");

const Subscription = require(
  "../models/Subscription"
);

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

/*
|--------------------------------------------------------------------------
| Get local subscription ID
|--------------------------------------------------------------------------
*/

const getSubscriptionId = (object) => {
  return (
    object?.metadata?.subscriptionId ||
    ""
  );
};

/*
|--------------------------------------------------------------------------
| Find local subscription
|--------------------------------------------------------------------------
*/

const findLocalSubscription = async (
  object
) => {
  const localSubscriptionId =
    getSubscriptionId(object);

  if (localSubscriptionId) {
    const localSubscription =
      await Subscription.findById(
        localSubscriptionId
      );

    if (localSubscription) {
      return localSubscription;
    }
  }

  if (object?.subscription) {
    const stripeSubscriptionId =
      typeof object.subscription ===
      "string"
        ? object.subscription
        : object.subscription.id;

    const localSubscription =
      await Subscription.findOne({
        stripeSubscriptionId,
      });

    if (localSubscription) {
      return localSubscription;
    }
  }

  if (object?.id) {
    return Subscription.findOne({
      $or: [
        {
          stripeCheckoutSessionId:
            object.id,
        },
        {
          stripeSubscriptionId:
            object.id,
        },
      ],
    });
  }

  return null;
};

/*
|--------------------------------------------------------------------------
| Check processed Stripe event
|--------------------------------------------------------------------------
*/

const hasProcessedStripeEvent = async (
  object,
  eventId
) => {
  const subscription =
    await findLocalSubscription(object);

  if (!subscription) {
    return false;
  }

  return subscription.processedStripeEventIds.includes(
    eventId
  );
};

/*
|--------------------------------------------------------------------------
| Mark Stripe event processed
|--------------------------------------------------------------------------
*/

const markStripeEventProcessed = async (
  object,
  eventId
) => {
  const subscription =
    await findLocalSubscription(object);

  if (!subscription) {
    return;
  }

  if (
    !subscription.processedStripeEventIds.includes(
      eventId
    )
  ) {
    subscription.processedStripeEventIds.push(
      eventId
    );

    await subscription.save();
  }
};

/*
|--------------------------------------------------------------------------
| Checkout completed
|--------------------------------------------------------------------------
*/

const updateCheckoutCompleted = async (
  session
) => {
  const subscription =
    await findLocalSubscription(session);

  if (!subscription) {
    console.log(
      "Local subscription not found for Checkout Session:",
      session.id
    );

    return;
  }

  const now = new Date();

  subscription.paymentProvider =
    "stripe";

  subscription.stripeCheckoutSessionId =
    session.id;

  subscription.stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || "";

  subscription.stripeSubscriptionId =
    typeof session.subscription ===
    "string"
      ? session.subscription
      : session.subscription?.id || "";

  subscription.stripePaymentIntentId =
    typeof session.payment_intent ===
    "string"
      ? session.payment_intent
      : session.payment_intent?.id || "";

  if (
    subscription.billingType ===
    "one_time"
  ) {
    subscription.status = "active";
  }

  subscription.startDate =
    subscription.startDate || now;

  const paidAmount =
    Number(session.amount_total || 0) /
    100;

  if (
    subscription.billingType ===
    "one_time"
  ) {
    subscription.lastPaymentAmount =
      paidAmount;

    subscription.totalPaidAmount =
      Number(
        subscription.totalPaidAmount || 0
      ) + paidAmount;

    subscription.lastPaymentDate = now;
  }

  subscription.failedPaymentCount = 0;

  if (
    subscription.billingType ===
    "one_time"
  ) {
    subscription.currentPeriodStart =
      null;

    subscription.currentPeriodEnd =
      null;

    subscription.nextBillingDate =
      null;
  }

  await subscription.save();

  console.log(
    "Checkout payment recorded:",
    subscription._id
  );
};

/*
|--------------------------------------------------------------------------
| Invoice paid
|--------------------------------------------------------------------------
*/

const updateInvoicePaid = async (
  invoice
) => {
  const subscription =
    await findLocalSubscription(invoice);

  if (!subscription) {
    console.log(
      "Local subscription not found for paid invoice:",
      invoice.id
    );

    return;
  }

  const now = new Date();

  subscription.paymentProvider =
    "stripe";

  subscription.status = "active";

  subscription.stripeLatestInvoiceId =
    invoice.id;

  subscription.stripeCustomerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id || "";

  if (invoice.subscription) {
    subscription.stripeSubscriptionId =
      typeof invoice.subscription ===
      "string"
        ? invoice.subscription
        : invoice.subscription.id;
  }

  const paidAmount =
    Number(invoice.amount_paid || 0) /
    100;

  subscription.lastPaymentAmount =
    paidAmount;

  subscription.lastPaymentDate = now;

  subscription.totalPaidAmount =
    Number(
      subscription.totalPaidAmount || 0
    ) + paidAmount;

  subscription.failedPaymentCount = 0;

  if (invoice.period_start) {
    subscription.currentPeriodStart =
      new Date(
        invoice.period_start * 1000
      );
  }

  if (invoice.period_end) {
    subscription.currentPeriodEnd =
      new Date(
        invoice.period_end * 1000
      );

    subscription.nextBillingDate =
      new Date(
        invoice.period_end * 1000
      );
  }

  await subscription.save();

  console.log(
    "Stripe invoice payment recorded:",
    subscription._id
  );
};

/*
|--------------------------------------------------------------------------
| Invoice payment failed
|--------------------------------------------------------------------------
*/

const updateInvoiceFailed = async (
  invoice
) => {
  const subscription =
    await findLocalSubscription(invoice);

  if (!subscription) {
    return;
  }

  subscription.status = "past_due";

  subscription.stripeLatestInvoiceId =
    invoice.id;

  subscription.failedPaymentCount =
    Number(
      subscription.failedPaymentCount ||
        0
    ) + 1;

  await subscription.save();

  console.log(
    "Stripe invoice marked past due:",
    subscription._id
  );
};

/*
|--------------------------------------------------------------------------
| Stripe subscription sync
|--------------------------------------------------------------------------
*/

const updateStripeSubscription = async (
  stripeSubscription
) => {
  const subscription =
    await findLocalSubscription(
      stripeSubscription
    );

  if (!subscription) {
    console.log(
      "Local subscription not found for Stripe subscription:",
      stripeSubscription.id
    );

    return;
  }

  subscription.stripeSubscriptionId =
    stripeSubscription.id;

  subscription.stripeCustomerId =
    typeof stripeSubscription.customer ===
    "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id ||
        "";

  /*
  |--------------------------------------------------------------------------
  | Stripe subscription item
  |--------------------------------------------------------------------------
  */

  const stripeItem =
    stripeSubscription.items?.data?.[0];

  /*
  |--------------------------------------------------------------------------
  | Status
  |--------------------------------------------------------------------------
  */

  const statusMap = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    unpaid: "unpaid",
    paused: "paused",
    canceled: "cancelled",
    incomplete: "incomplete",
    incomplete_expired:
      "incomplete_expired",
  };

  subscription.status =
    statusMap[stripeSubscription.status] ||
    subscription.status;

  /*
  |--------------------------------------------------------------------------
  | Cancellation
  |--------------------------------------------------------------------------
  */

  const hasScheduledCancellation =
    Boolean(
      stripeSubscription.cancel_at_period_end
    ) ||
    Boolean(stripeSubscription.cancel_at);

  subscription.cancelAtPeriodEnd =
    hasScheduledCancellation;

  subscription.autoRenew =
    !hasScheduledCancellation;

  if (stripeSubscription.cancel_at) {
    subscription.currentPeriodEnd =
      new Date(
        stripeSubscription.cancel_at *
          1000
      );

    subscription.nextBillingDate =
      new Date(
        stripeSubscription.cancel_at *
          1000
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Trial
  |--------------------------------------------------------------------------
  */

  if (
    stripeSubscription.status ===
      "trialing" &&
    stripeSubscription.trial_end
  ) {
    subscription.trialEndsAt =
      new Date(
        stripeSubscription.trial_end *
          1000
      );

    subscription.nextBillingDate =
      new Date(
        stripeSubscription.trial_end *
          1000
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Current billing period
  |--------------------------------------------------------------------------
  | Stripe currently exposes the billing period on the subscription item.
  */

  if (stripeItem?.current_period_start) {
    subscription.currentPeriodStart =
      new Date(
        stripeItem.current_period_start *
          1000
      );
  }

  if (stripeItem?.current_period_end) {
    subscription.currentPeriodEnd =
      new Date(
        stripeItem.current_period_end *
          1000
      );

    if (
      stripeSubscription.status !==
        "trialing" &&
      !stripeSubscription.cancel_at
    ) {
      subscription.nextBillingDate =
        new Date(
          stripeItem.current_period_end *
            1000
        );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Stripe Price / Product
  |--------------------------------------------------------------------------
  */

  if (stripeItem?.price?.id) {
    subscription.stripePriceId =
      stripeItem.price.id;
  }

  if (stripeItem?.price?.product) {
    subscription.stripeProductId =
      typeof stripeItem.price.product ===
      "string"
        ? stripeItem.price.product
        : stripeItem.price.product?.id ||
          subscription.stripeProductId;
  }

  /*
  |--------------------------------------------------------------------------
  | Cancelled subscription
  |--------------------------------------------------------------------------
  */

  if (
    stripeSubscription.status ===
    "canceled"
  ) {
    subscription.cancelledAt =
      new Date();

    subscription.autoRenew = false;

    subscription.cancelAtPeriodEnd =
      false;

    subscription.nextBillingDate =
      null;
  }

  /*
  |--------------------------------------------------------------------------
  | Debug logs
  |--------------------------------------------------------------------------
  */

  console.log(
    "=== Stripe Subscription Update ==="
  );

  console.log(
    "Local ID:",
    subscription._id
  );

  console.log(
    "Stripe Subscription ID:",
    stripeSubscription.id
  );

  console.log(
    "Stripe Status:",
    stripeSubscription.status
  );

  console.log(
    "Cancel At Period End:",
    stripeSubscription.cancel_at_period_end
  );

  console.log(
    "Stripe Cancel At:",
    stripeSubscription.cancel_at
  );

  console.log(
    "Stripe Period Start:",
    stripeItem?.current_period_start
  );

  console.log(
    "Stripe Period End:",
    stripeItem?.current_period_end
  );

  console.log(
    "Local Next Billing:",
    subscription.nextBillingDate
  );

  await subscription.save();
};

/*
|--------------------------------------------------------------------------
| Stripe Webhook
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  express.raw({
    type: "application/json",
  }),
  async (req, res) => {
    const signature =
      req.headers["stripe-signature"];

    let event;

    /*
    |--------------------------------------------------------------------------
    | Verify webhook signature
    |--------------------------------------------------------------------------
    */

    try {
      if (
        !process.env
          .STRIPE_WEBHOOK_SECRET
      ) {
        throw new Error(
          "STRIPE_WEBHOOK_SECRET is missing."
        );
      }

      event =
        stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env
            .STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
      console.error(
        "Stripe webhook verification failed:",
        error.message
      );

      return res.status(400).send(
        `Webhook Error: ${error.message}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate processing
    |--------------------------------------------------------------------------
    */

    const alreadyProcessed =
      await hasProcessedStripeEvent(
        event.data.object,
        event.id
      );

    if (alreadyProcessed) {
      return res.status(200).json({
        received: true,
        duplicate: true,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Handle Stripe event
    |--------------------------------------------------------------------------
    */

    try {
      switch (event.type) {
        case "checkout.session.completed":

        case "checkout.session.async_payment_succeeded":
          await updateCheckoutCompleted(
            event.data.object
          );
          break;

        case "invoice.paid":
          await updateInvoicePaid(
            event.data.object
          );
          break;

        case "invoice.payment_failed":
          await updateInvoiceFailed(
            event.data.object
          );
          break;

        case "customer.subscription.created":

        case "customer.subscription.updated":

        case "customer.subscription.deleted":
          await updateStripeSubscription(
            event.data.object
          );
          break;

        default:
          console.log(
            `Unhandled Stripe event: ${event.type}`
          );
      }

      /*
      |--------------------------------------------------------------------------
      | Mark event processed
      |--------------------------------------------------------------------------
      */

      await markStripeEventProcessed(
        event.data.object,
        event.id
      );

      return res.status(200).json({
        received: true,
      });
    } catch (error) {
      console.error(
        "Stripe webhook processing error:",
        error
      );

      return res.status(500).json({
        received: false,
        message:
          error.message ||
          "Webhook processing failed.",
      });
    }
  }
);

module.exports = router;