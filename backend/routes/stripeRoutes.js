const express = require("express");
const Stripe = require("stripe");

const Subscription = require("../models/Subscription");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY
);

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:3000";

/*
|--------------------------------------------------------------------------
| Create Stripe Checkout Session
|--------------------------------------------------------------------------
| POST /api/stripe/create-checkout-session
|--------------------------------------------------------------------------
*/

router.post(
  "/create-checkout-session",
  authMiddleware,
  async (req, res) => {
    try {
      const { subscriptionId } = req.body;

      if (!subscriptionId) {
        return res.status(400).json({
          success: false,
          message:
            "Subscription ID is required.",
        });
      }

      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({
          success: false,
          message:
            "Stripe secret key is not configured.",
        });
      }

      const subscription =
        await Subscription.findById(
          subscriptionId
        )
          .populate(
            "customer",
            "name fullName companyName email"
          )
          .populate(
            "company",
            "name companyName email"
          );

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message:
            "Subscription or service not found.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Security check
      |--------------------------------------------------------------------------
      */

      const loggedInUserId = String(
        req.user?._id ||
          req.user?.id ||
          req.user?.userId ||
          ""
      );

      const loggedInCompanyId = String(
        req.user?.company?._id ||
          req.user?.company ||
          req.user?.companyId ||
          ""
      );

      const subscriptionCompanyId = String(
        subscription.company?._id ||
          subscription.company ||
          ""
      );

      const subscriptionCreatorId = String(
        subscription.createdBy || ""
      );

      const sameCompany =
        loggedInCompanyId &&
        subscriptionCompanyId &&
        loggedInCompanyId ===
          subscriptionCompanyId;

      const isCreator =
        loggedInUserId &&
        subscriptionCreatorId &&
        loggedInUserId ===
          subscriptionCreatorId;

      const allowedRoles = [
        "admin",
        "owner",
        "superadmin",
      ];

      const hasAdminRole =
        allowedRoles.includes(req.user?.role);

      if (
        !sameCompany &&
        !isCreator &&
        !hasAdminRole
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to pay for this subscription.",
        });
      }

      if (
        [
          "cancelled",
          "completed",
          "expired",
        ].includes(subscription.status)
      ) {
        return res.status(400).json({
          success: false,
          message: `Payment cannot be created for a ${subscription.status} record.`,
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Determine Stripe mode
      |--------------------------------------------------------------------------
      */

      const isRecurring =
        subscription.billingType ===
        "recurring";

      const checkoutMode = isRecurring
        ? "subscription"
        : "payment";

      /*
      |--------------------------------------------------------------------------
      | Calculate payment amount
      |--------------------------------------------------------------------------
      */

      let paymentAmount = Number(
        subscription.price || 0
      );

      if (
        subscription.firstPaymentAmount !==
          null &&
        subscription.firstPaymentAmount !==
          undefined &&
        Number(
          subscription.firstPaymentAmount
        ) >= 0
      ) {
        paymentAmount = Number(
          subscription.firstPaymentAmount
        );
      }

      if (paymentAmount <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "The payment amount must be greater than zero.",
        });
      }

      const amountInSmallestUnit =
        Math.round(paymentAmount * 100);

      const currency = String(
        subscription.currency || "GBP"
      ).toLowerCase();

      const productName =
        subscription.productName ||
        subscription.planName ||
        "Global Digital Solutions Service";

      /*
      |--------------------------------------------------------------------------
      | Price data
      |--------------------------------------------------------------------------
      */

      const priceData = {
        currency,
        unit_amount:
          amountInSmallestUnit,

        product_data: {
          name: productName,

          description:
            subscription.description ||
            `${productName} provided by Global Digital Solutions`,

          metadata: {
            subscriptionId: String(
              subscription._id
            ),

            productCode:
              subscription.productCode ||
              "",

            productType:
              subscription.productType ||
              "",

            companyId:
              subscriptionCompanyId,
          },
        },
      };

      /*
      |--------------------------------------------------------------------------
      | Recurring billing interval
      |--------------------------------------------------------------------------
      */

      if (isRecurring) {
        priceData.recurring = {
          interval:
            subscription.billingCycle ===
            "yearly"
              ? "year"
              : "month",
        };
      }

      /*
      |--------------------------------------------------------------------------
      | Customer email
      |--------------------------------------------------------------------------
      */

      const customerEmail =
        subscription.customer?.email ||
        subscription.company?.email ||
        req.user?.email ||
        undefined;

      /*
      |--------------------------------------------------------------------------
      | Checkout Session configuration
      |--------------------------------------------------------------------------
      */

      const sessionData = {
        mode: checkoutMode,

        payment_method_types: ["card"],

        line_items: [
          {
            price_data: priceData,
            quantity: 1,
          },
        ],

        success_url:
          `${FRONTEND_URL}/subscription` +
          `?payment=success` +
          `&session_id={CHECKOUT_SESSION_ID}`,

        cancel_url:
          `${FRONTEND_URL}/subscription` +
          `?payment=cancelled`,

        metadata: {
          subscriptionId: String(
            subscription._id
          ),

          companyId:
            subscriptionCompanyId,

          productCode:
            subscription.productCode ||
            "",

          userId: loggedInUserId,
        },

        billing_address_collection:
          "auto",

        allow_promotion_codes: true,
      };

      if (customerEmail) {
        sessionData.customer_email =
          customerEmail;
      }

      /*
      |--------------------------------------------------------------------------
      | Subscription-specific data
      |--------------------------------------------------------------------------
      */

      if (isRecurring) {
        sessionData.subscription_data = {
          metadata: {
            subscriptionId: String(
              subscription._id
            ),

            companyId:
              subscriptionCompanyId,

            productCode:
              subscription.productCode ||
              "",
          },
        };

        if (
          Number(
            subscription.trialDays || 0
          ) > 0
        ) {
          sessionData.subscription_data.trial_period_days =
            Number(
              subscription.trialDays
            );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | One-time payment data
      |--------------------------------------------------------------------------
      */

      if (!isRecurring) {
        sessionData.customer_creation =
          "always";

        sessionData.payment_intent_data = {
          metadata: {
            subscriptionId: String(
              subscription._id
            ),

            companyId:
              subscriptionCompanyId,

            productCode:
              subscription.productCode ||
              "",
          },
        };
      }

      /*
      |--------------------------------------------------------------------------
      | Create Stripe Checkout Session
      |--------------------------------------------------------------------------
      */

      const session =
        await stripe.checkout.sessions.create(
          sessionData
        );

      subscription.stripeCheckoutSessionId =
        session.id;

      subscription.paymentProvider =
        "stripe";

      if (
        subscription.status === "draft"
      ) {
        subscription.status = "pending";
      }

      await subscription.save();

      return res.status(200).json({
        success: true,

        message:
          "Stripe Checkout Session created successfully.",

        checkoutUrl: session.url,

        sessionId: session.id,
      });
    } catch (error) {
      console.error(
        "Stripe Checkout error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to create Stripe Checkout Session.",
      });
    }
  }
);

router.post(
  "/create-customer-portal",
  authMiddleware,
  async (req, res) => {
    try {
      const { subscriptionId } = req.body;

      const subscription =
        await Subscription.findById(
          subscriptionId
        );

      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found.",
        });
      }

      if (!subscription.stripeCustomerId) {
        return res.status(400).json({
          success: false,
          message:
            "Stripe customer has not been created yet.",
        });
      }

      const session =
        await stripe.billingPortal.sessions.create(
          {
            customer:
              subscription.stripeCustomerId,
            return_url:
              `${FRONTEND_URL}/subscription`,
          }
        );

      return res.json({
        success: true,
        portalUrl: session.url,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Unable to create customer portal.",
      });
    }
  }
);

module.exports = router;