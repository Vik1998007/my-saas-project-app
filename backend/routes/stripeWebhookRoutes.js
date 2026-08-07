const express = require("express");
const Stripe = require("stripe");

const Subscription = require(
  "../models/Subscription"
);

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

const getSubscriptionId = (object) => {
  return (
    object?.metadata?.subscriptionId ||
    ""
  );
};

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
  subscription.billingType === "one_time"
) {
  subscription.status = "active";
}
  subscription.startDate =
    subscription.startDate || now;

  subscription.lastPaymentDate = now;

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

    subscription.nextBillingDate = null;
  }

  await subscription.save();

  console.log(
    "Checkout payment recorded:",
    subscription._id
  );
};

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

const updateStripeSubscription = async (
  stripeSubscription
) => {
  const subscription =
    await findLocalSubscription(
      stripeSubscription
    );

  if (!subscription) {
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
      stripeSubscription.cancel_at * 1000
    );

  subscription.nextBillingDate =
    new Date(
      stripeSubscription.cancel_at * 1000
    );
}
  if (
    stripeSubscription.current_period_start
  ) {
    subscription.currentPeriodStart =
      new Date(
        stripeSubscription.current_period_start *
          1000
      );
  }

  if (
    stripeSubscription.current_period_end
  ) {
    subscription.currentPeriodEnd =
      new Date(
        stripeSubscription.current_period_end *
          1000
      );

    subscription.nextBillingDate =
      new Date(
        stripeSubscription.current_period_end *
          1000
      );
  }

  if (
    stripeSubscription.status ===
    "canceled"
  ) {
    subscription.cancelledAt =
      new Date();

    subscription.autoRenew = false;
    subscription.nextBillingDate =
      null;
  }
  console.log("=== Stripe Update ===");
console.log("Local ID:", subscription._id);
console.log(
  "Cancel At Period End:",
  stripeSubscription.cancel_at_period_end
);
console.log(
  "Local cancelAtPeriodEnd before save:",
  subscription.cancelAtPeriodEnd
);
console.log(
  "Stripe Status:",
  stripeSubscription.status
);
console.log(
  "Stripe Cancel At:",
  stripeSubscription.cancel_at
);

  await subscription.save();
};

router.post(
  "/",
  express.raw({
    type: "application/json",
  }),
  async (req, res) => {
    const signature =
      req.headers["stripe-signature"];

    let event;

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
          "Webhook processing failed.",
      });
    }
  }
);

module.exports = router;