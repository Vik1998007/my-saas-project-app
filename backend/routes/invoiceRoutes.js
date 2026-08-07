const express = require("express");
const PDFDocument = require("pdfkit");

const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Helper - Get Current User Company
|--------------------------------------------------------------------------
*/

const getCurrentUserCompany = async (req) => {
  const userId =
    req.user?.id ||
    req.user?.userId ||
    req.user?._id;

  if (!userId) {
    return {
      user: null,
      companyId: null,
    };
  }

  const user = await User.findById(userId).select(
    "company isActive role"
  );

  if (
    !user ||
    user.isActive === false ||
    !user.company
  ) {
    return {
      user,
      companyId: null,
    };
  }

  return {
    user,
    companyId: user.company,
  };
};

/*
|--------------------------------------------------------------------------
| Helper - Generate Invoice Number
|--------------------------------------------------------------------------
*/

const generateInvoiceNumber = async (companyId) => {
  const currentYear = new Date().getFullYear();

  const totalInvoices = await Invoice.countDocuments({
    company: companyId,
  });

  const nextNumber = String(
    totalInvoices + 1
  ).padStart(5, "0");

  return `INV-${currentYear}-${nextNumber}`;
};

/*
|--------------------------------------------------------------------------
| Admin - Create Invoice
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        customer,
        issueDate,
        dueDate,
        items,
        taxRate = 0,
        discountType = "none",
        discountValue = 0,
        currency = "GBP",
        notes = "",
        terms = "",
      } = req.body;

      if (!customer || !dueDate) {
        return res.status(400).json({
          success: false,
          message:
            "Customer and due date are required.",
        });
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one invoice item is required.",
        });
      }

      const { user, companyId } =
        await getCurrentUserCompany(req);

      if (!user || !companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const customerRecord =
        await Customer.findOne({
          _id: customer,
          company: companyId,
        });

      if (!customerRecord) {
        return res.status(404).json({
          success: false,
          message:
            "Customer not found in your company.",
        });
      }

      const invoiceNumber =
        await generateInvoiceNumber(companyId);

      const invoice = await Invoice.create({
        company: companyId,
        customer,
        createdBy: user._id,
        invoiceNumber,
        issueDate: issueDate || new Date(),
        dueDate,
        items,
        taxRate,
        discountType,
        discountValue,
        currency,
        notes,
        terms,
      });

      const populatedInvoice =
        await Invoice.findById(invoice._id)
          .populate(
            "customer",
            "name fullName companyName email phone address"
          )
          .populate(
            "createdBy",
            "fullName email role"
          );

      return res.status(201).json({
        success: true,
        message:
          "Invoice created successfully.",
        invoice: populatedInvoice,
      });
    } catch (error) {
      console.error(
        "Create invoice error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to create invoice.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Get All Invoices
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const {
        status,
        customer,
        search,
      } = req.query;

      const filter = {
        company: companyId,
      };

      if (status) {
        filter.status = status;
      }

      if (customer) {
        filter.customer = customer;
      }

      if (search) {
        filter.invoiceNumber = {
          $regex: search.trim(),
          $options: "i",
        };
      }

      const invoices = await Invoice.find(
        filter
      )
        .populate(
          "customer",
          "name fullName companyName email phone"
        )
        .populate(
          "createdBy",
          "fullName email role"
        )
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count: invoices.length,
        invoices,
      });
    } catch (error) {
      console.error(
        "Get invoices error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load invoices.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Get Invoice Summary
|--------------------------------------------------------------------------
*/

router.get(
  "/summary",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const invoices = await Invoice.find({
        company: companyId,
      }).select(
        "status totalAmount paidAmount balanceAmount"
      );

      const summary = invoices.reduce(
        (result, invoice) => {
          result.totalInvoices += 1;

          result.totalAmount +=
            Number(invoice.totalAmount) || 0;

          result.totalPaid +=
            Number(invoice.paidAmount) || 0;

          result.totalOutstanding +=
            Number(invoice.balanceAmount) || 0;

          if (invoice.status === "draft") {
            result.draftInvoices += 1;
          }

          if (invoice.status === "sent") {
            result.sentInvoices += 1;
          }

          if (
            invoice.status ===
            "partially_paid"
          ) {
            result.partiallyPaidInvoices += 1;
          }

          if (invoice.status === "paid") {
            result.paidInvoices += 1;
          }

          if (
            invoice.status === "overdue"
          ) {
            result.overdueInvoices += 1;
          }

          if (
            invoice.status === "cancelled"
          ) {
            result.cancelledInvoices += 1;
          }

          return result;
        },
        {
          totalInvoices: 0,
          draftInvoices: 0,
          sentInvoices: 0,
          partiallyPaidInvoices: 0,
          paidInvoices: 0,
          overdueInvoices: 0,
          cancelledInvoices: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalOutstanding: 0,
        }
      );

      summary.totalAmount = Number(
        summary.totalAmount.toFixed(2)
      );

      summary.totalPaid = Number(
        summary.totalPaid.toFixed(2)
      );

      summary.totalOutstanding = Number(
        summary.totalOutstanding.toFixed(2)
      );

      return res.status(200).json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error(
        "Invoice summary error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load invoice summary.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Download Invoice PDF
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/pdf",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        company: companyId,
      })
        .populate(
          "customer",
          "name fullName companyName email phone address"
        )
        .populate(
          "createdBy",
          "fullName email role"
        );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found.",
        });
      }

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${invoice.invoiceNumber}.pdf"`
      );

      doc.pipe(res);

      doc
        .fontSize(22)
        .text(
          "Global Digital Solutions",
          {
            align: "center",
          }
        );

      doc.moveDown();

      doc
        .fontSize(18)
        .text(
          `Invoice ${invoice.invoiceNumber}`
        );

      doc.moveDown();

      doc
        .fontSize(11)
        .text(
          `Issue Date: ${new Date(
            invoice.issueDate
          ).toLocaleDateString("en-GB")}`
        );

      doc.text(
        `Due Date: ${new Date(
          invoice.dueDate
        ).toLocaleDateString("en-GB")}`
      );

      doc.text(
        `Status: ${invoice.status}`
      );

      doc.moveDown();

      const customerName =
        invoice.customer?.companyName ||
        invoice.customer?.fullName ||
        invoice.customer?.name ||
        "Customer";

      doc
        .fontSize(13)
        .text("Bill To:");

      doc
        .fontSize(11)
        .text(customerName);

      if (invoice.customer?.email) {
        doc.text(
          invoice.customer.email
        );
      }

      if (invoice.customer?.phone) {
        doc.text(
          invoice.customer.phone
        );
      }

      doc.moveDown();

      doc
        .fontSize(12)
        .text("Items");

      doc.moveDown(0.5);

      invoice.items.forEach(
        (item, index) => {
          doc
            .fontSize(10)
            .text(
              `${index + 1}. ${item.description}`
            );

          doc.text(
            `Qty: ${item.quantity}  Rate: ${invoice.currency} ${Number(
              item.rate
            ).toFixed(2)}  Amount: ${invoice.currency} ${Number(
              item.amount
            ).toFixed(2)}`
          );

          doc.moveDown(0.5);
        }
      );

      doc.moveDown();

      doc.text(
        `Subtotal: ${invoice.currency} ${Number(
          invoice.subtotal
        ).toFixed(2)}`
      );

      doc.text(
        `Tax: ${invoice.currency} ${Number(
          invoice.taxAmount
        ).toFixed(2)}`
      );

      doc.text(
        `Discount: ${invoice.currency} ${Number(
          invoice.discountAmount
        ).toFixed(2)}`
      );

      doc
        .fontSize(13)
        .text(
          `Total: ${invoice.currency} ${Number(
            invoice.totalAmount
          ).toFixed(2)}`
        );

      doc.text(
        `Paid: ${invoice.currency} ${Number(
          invoice.paidAmount
        ).toFixed(2)}`
      );

      doc.text(
        `Balance: ${invoice.currency} ${Number(
          invoice.balanceAmount
        ).toFixed(2)}`
      );

      if (invoice.notes) {
        doc.moveDown();
        doc
          .fontSize(11)
          .text("Notes:");

        doc.text(
          invoice.notes
        );
      }

      if (invoice.terms) {
        doc.moveDown();
        doc
          .fontSize(11)
          .text("Terms:");

        doc.text(
          invoice.terms
        );
      }

      doc.end();
    } catch (error) {
      console.error(
        "Invoice PDF error:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            "Unable to generate invoice PDF.",
        });
      }
    }
  }
);
/*
|--------------------------------------------------------------------------
| Admin - Get Single Invoice
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        company: companyId,
      })
        .populate(
          "customer",
          "name fullName companyName email phone address"
        )
        .populate(
          "createdBy",
          "fullName email role"
        );

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found.",
        });
      }

      return res.status(200).json({
        success: true,
        invoice,
      });
    } catch (error) {
      console.error(
        "Get invoice error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load invoice.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Update Invoice
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found.",
        });
      }

      const allowedFields = [
        "customer",
        "issueDate",
        "dueDate",
        "items",
        "taxRate",
        "discountType",
        "discountValue",
        "currency",
        "notes",
        "terms",
        "status",
        "paymentMethod",
      ];

      allowedFields.forEach((field) => {
        if (
          req.body[field] !== undefined
        ) {
          invoice[field] =
            req.body[field];
        }
      });

      if (req.body.customer) {
        const customerRecord =
          await Customer.findOne({
            _id: req.body.customer,
            company: companyId,
          });

        if (!customerRecord) {
          return res.status(404).json({
            success: false,
            message:
              "Customer not found in your company.",
          });
        }
      }

      await invoice.save();

      const updatedInvoice =
        await Invoice.findById(invoice._id)
          .populate(
            "customer",
            "name fullName companyName email phone address"
          )
          .populate(
            "createdBy",
            "fullName email role"
          );

      return res.status(200).json({
        success: true,
        message:
          "Invoice updated successfully.",
        invoice: updatedInvoice,
      });
    } catch (error) {
      console.error(
        "Update invoice error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update invoice.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Record Invoice Payment
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/payment",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        paidAmount,
        paymentMethod,
        paymentDate,
      } = req.body;

      if (
        paidAmount === undefined ||
        Number(paidAmount) < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid paid amount is required.",
        });
      }

      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found.",
        });
      }

      invoice.paidAmount =
        Number(paidAmount);

      invoice.paymentMethod =
        paymentMethod ||
        invoice.paymentMethod;

      invoice.paymentDate =
        paymentDate || new Date();

      await invoice.save();

      return res.status(200).json({
        success: true,
        message:
          "Invoice payment updated successfully.",
        invoice,
      });
    } catch (error) {
      console.error(
        "Invoice payment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update invoice payment.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Mark Invoice as Sent
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/send",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found.",
        });
      }

      invoice.status = "sent";
      invoice.sentAt = new Date();

      await invoice.save();

      return res.status(200).json({
        success: true,
        message:
          "Invoice marked as sent.",
        invoice,
      });
    } catch (error) {
      console.error(
        "Send invoice error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to send invoice.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Cancel Invoice
|--------------------------------------------------------------------------
*/

router.put(
  "/:id/cancel",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found.",
        });
      }

      invoice.status = "cancelled";

      await invoice.save();

      return res.status(200).json({
        success: true,
        message:
          "Invoice cancelled successfully.",
        invoice,
      });
    } catch (error) {
      console.error(
        "Cancel invoice error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to cancel invoice.",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Admin - Delete Invoice
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to an active company.",
        });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        company: companyId,
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Invoice not found.",
        });
      }

      await invoice.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Invoice deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete invoice error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to delete invoice.",
      });
    }
  }
);

module.exports = router;