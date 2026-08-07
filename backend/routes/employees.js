const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");
const Employee = require("../models/Employee");
const CompanyMember = require("../models/CompanyMember");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Get Logged-In User ID
|--------------------------------------------------------------------------
*/

const getLoggedInUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId ||
    req.userId ||
    null
  );
};

/*
|--------------------------------------------------------------------------
| Get Logged-In User and Company
|--------------------------------------------------------------------------
*/

const getCurrentUserAndCompany = async (req) => {
  const loggedInUserId = getLoggedInUserId(req);

  if (!loggedInUserId) {
    return {
      user: null,
      companyId: null,
    };
  }

  const currentUser = await User.findById(loggedInUserId);

  if (!currentUser || !currentUser.company) {
    return {
      user: currentUser,
      companyId: null,
    };
  }

  return {
    user: currentUser,
    companyId: currentUser.company,
  };
};

/*
|--------------------------------------------------------------------------
| Add Employee
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    let createdUser = null;
    let createdEmployee = null;
    let createdCompanyMember = null;

    try {
      const {
        fullName,
        email,
        password,
        role,
        phone,
        designation,
        department,
        salary,
        joiningDate,
      } = req.body;

      if (!fullName || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message:
            "Full name, email, password and role are required.",
        });
      }

      if (!["manager", "employee"].includes(role)) {
        return res.status(400).json({
          success: false,
          message:
            "Role must be manager or employee.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 6 characters.",
        });
      }

      const { companyId } =
        await getCurrentUserAndCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to a company.",
        });
      }

      const normalizedEmail = email
        .toLowerCase()
        .trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }

      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      /*
      |--------------------------------------------------------------------------
      | Create Login User
      |--------------------------------------------------------------------------
      */

      createdUser = await User.create({
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        company: companyId,
        isActive: true,
      });

      /*
      |--------------------------------------------------------------------------
      | Create Employee Record
      |--------------------------------------------------------------------------
      */

      createdEmployee = await Employee.create({
        company: companyId,
        user: createdUser._id,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || "",
        designation: designation?.trim() || "",
        department: department?.trim() || "",
        salary:
          salary !== undefined &&
          salary !== null &&
          salary !== ""
            ? Number(salary)
            : 0,
        joiningDate: joiningDate || new Date(),
        isActive: true,
      });

      /*
      |--------------------------------------------------------------------------
      | Create Company Member
      |--------------------------------------------------------------------------
      */

      createdCompanyMember =
        await CompanyMember.create({
          company: companyId,
          user: createdUser._id,
          role,
          isActive: true,
        });

      return res.status(201).json({
        success: true,
        message: "Employee added successfully.",
        employee: {
          id: createdEmployee._id,
          userId: createdUser._id,
          company: companyId,
          fullName: createdEmployee.fullName,
          email: createdEmployee.email,
          phone: createdEmployee.phone,
          designation: createdEmployee.designation,
          department: createdEmployee.department,
          salary: createdEmployee.salary,
          joiningDate: createdEmployee.joiningDate,
          role: createdUser.role,
          isActive: createdEmployee.isActive,
          createdAt: createdEmployee.createdAt,
        },
      });
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | Rollback if one record fails
      |--------------------------------------------------------------------------
      */

      if (createdCompanyMember) {
        await CompanyMember.findByIdAndDelete(
          createdCompanyMember._id
        );
      }

      if (createdEmployee) {
        await Employee.findByIdAndDelete(
          createdEmployee._id
        );
      }

      if (createdUser) {
        await User.findByIdAndDelete(createdUser._id);
      }

      return res.status(500).json({
        success: false,
        message: "Unable to add employee.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get All Employees of Current Company
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserAndCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to a company.",
        });
      }

      const employeeRecords = await Employee.find({
        company: companyId,
      })
        .populate({
          path: "user",
          select:
            "fullName email role isActive company createdAt updatedAt",
        })
        .sort({
          createdAt: -1,
        });

      const employees = employeeRecords.map(
        (employee) => ({
          id: employee._id,
          _id: employee._id,
          userId: employee.user?._id || null,
          company: employee.company,
          fullName:
            employee.user?.fullName ||
            employee.fullName,
          email:
            employee.user?.email || employee.email,
          phone: employee.phone,
          designation: employee.designation,
          department: employee.department,
          salary: employee.salary,
          joiningDate: employee.joiningDate,
          role: employee.user?.role || "employee",
          isActive:
            employee.isActive !== false &&
            employee.user?.isActive !== false,
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt,
        })
      );

      return res.status(200).json({
        success: true,
        count: employees.length,
        employees,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to load employees.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Get Single Employee
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserAndCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to a company.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID.",
        });
      }

      const employee = await Employee.findOne({
        company: companyId,
        $or: [
          {
            _id: req.params.id,
          },
          {
            user: req.params.id,
          },
        ],
      }).populate({
        path: "user",
        select:
          "fullName email role isActive company createdAt updatedAt",
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

      return res.status(200).json({
        success: true,
        employee: {
          id: employee._id,
          _id: employee._id,
          userId: employee.user?._id || null,
          company: employee.company,
          fullName:
            employee.user?.fullName ||
            employee.fullName,
          email:
            employee.user?.email || employee.email,
          phone: employee.phone,
          designation: employee.designation,
          department: employee.department,
          salary: employee.salary,
          joiningDate: employee.joiningDate,
          role: employee.user?.role || "employee",
          isActive:
            employee.isActive !== false &&
            employee.user?.isActive !== false,
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to load employee.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Update Employee
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        role,
        isActive,
        password,
        phone,
        designation,
        department,
        salary,
        joiningDate,
      } = req.body;

      const { companyId } =
        await getCurrentUserAndCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to a company.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID.",
        });
      }

      const employee = await Employee.findOne({
        company: companyId,
        $or: [
          {
            _id: req.params.id,
          },
          {
            user: req.params.id,
          },
        ],
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

      const employeeUser = await User.findOne({
        _id: employee.user,
        company: companyId,
      });

      if (!employeeUser) {
        return res.status(404).json({
          success: false,
          message:
            "Employee login account not found.",
        });
      }

      const companyMember =
        await CompanyMember.findOne({
          company: companyId,
          user: employeeUser._id,
        });

      if (
        companyMember?.role === "owner" ||
        employeeUser.role === "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Owner or administrator account cannot be updated here.",
        });
      }

      if (
        role &&
        !["manager", "employee"].includes(role)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Role must be manager or employee.",
        });
      }

      if (email) {
        const normalizedEmail = email
          .toLowerCase()
          .trim();

        const emailAlreadyExists =
          await User.findOne({
            email: normalizedEmail,
            _id: {
              $ne: employeeUser._id,
            },
          });

        if (emailAlreadyExists) {
          return res.status(400).json({
            success: false,
            message: "Email already exists.",
          });
        }

        employeeUser.email = normalizedEmail;
        employee.email = normalizedEmail;
      }

      if (fullName) {
        employeeUser.fullName = fullName.trim();
        employee.fullName = fullName.trim();
      }

      if (role) {
        employeeUser.role = role;

        if (companyMember) {
          companyMember.role = role;
        }
      }

      if (typeof isActive === "boolean") {
        employeeUser.isActive = isActive;
        employee.isActive = isActive;

        if (companyMember) {
          companyMember.isActive = isActive;
        }
      }

      if (password) {
        if (password.length < 6) {
          return res.status(400).json({
            success: false,
            message:
              "Password must be at least 6 characters.",
          });
        }

        employeeUser.password = await bcrypt.hash(
          password,
          10
        );
      }

      if (phone !== undefined) {
        employee.phone = phone?.trim() || "";
      }

      if (designation !== undefined) {
        employee.designation =
          designation?.trim() || "";
      }

      if (department !== undefined) {
        employee.department =
          department?.trim() || "";
      }

      if (
        salary !== undefined &&
        salary !== null &&
        salary !== ""
      ) {
        employee.salary = Number(salary);
      }

      if (joiningDate) {
        employee.joiningDate = joiningDate;
      }

      await employeeUser.save();
      await employee.save();

      if (companyMember) {
        await companyMember.save();
      }

      return res.status(200).json({
        success: true,
        message: "Employee updated successfully.",
        employee: {
          id: employee._id,
          userId: employeeUser._id,
          company: employee.company,
          fullName: employee.fullName,
          email: employee.email,
          phone: employee.phone,
          designation: employee.designation,
          department: employee.department,
          salary: employee.salary,
          joiningDate: employee.joiningDate,
          role: employeeUser.role,
          isActive: employee.isActive,
          updatedAt: employee.updatedAt,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to update employee.",
        error: error.message,
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Delete Employee
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { companyId } =
        await getCurrentUserAndCompany(req);

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not connected to a company.",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid employee ID.",
        });
      }

      const employee = await Employee.findOne({
        company: companyId,
        $or: [
          {
            _id: req.params.id,
          },
          {
            user: req.params.id,
          },
        ],
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

      const companyMember =
        await CompanyMember.findOne({
          company: companyId,
          user: employee.user,
        });

      if (
        companyMember?.role === "owner" ||
        companyMember?.role === "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Owner or administrator account cannot be deleted.",
        });
      }

      await CompanyMember.deleteOne({
        company: companyId,
        user: employee.user,
      });

      await User.deleteOne({
        _id: employee.user,
        company: companyId,
      });

      await employee.deleteOne();

      return res.status(200).json({
        success: true,
        message: "Employee deleted successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to delete employee.",
        error: error.message,
      });
    }
  }
);

module.exports = router;