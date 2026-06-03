import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/user.model.js";
import Team from "./models/team.model.js";
import Project from "./models/project.model.js";
import Task from "./models/task.model.js";
import Message from "./models/message.model.js";
import ActivityLog from "./models/activityLog.model.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    // Cleanup
    await ActivityLog.deleteMany({});
    await Message.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    await Team.deleteMany({});
    await User.deleteMany({});

    console.log("Old data removed");

    // USERS
    const admin = await User.create({
      name: "Priya Sharma",
      email: "admin@demo.com",
      role: "admin",
      firebaseUid: "seed-admin"
    });

    const frontendManager = await User.create({
      name: "Gaurav Jain",
      email: "manager.frontend@demo.com",
      role: "manager",
      firebaseUid: "seed-fe-manager"
    });

    const rahul = await User.create({
      name: "Rahul Sharma",
      email: "rahul@demo.com",
      role: "member",
      firebaseUid: "seed-rahul"
    });

    const aman = await User.create({
      name: "Aman Gupta",
      email: "aman@demo.com",
      role: "member",
      firebaseUid: "seed-aman"
    });

    const backendManager = await User.create({
      name: "John Mathew",
      email: "manager.backend@demo.com",
      role: "manager",
      firebaseUid: "seed-be-manager"
    });

    const neha = await User.create({
      name: "Neha Verma",
      email: "neha@demo.com",
      role: "member",
      firebaseUid: "seed-neha"
    });

    // TEAMS
    const frontendTeam = await Team.create({
      name: "Frontend Team",
      description: "Responsible for UI and UX",
      adminId: admin._id
    });

    const backendTeam = await Team.create({
      name: "Backend Team",
      description: "Responsible for APIs and database",
      adminId: admin._id
    });

    // Assign teamIds
    await User.findByIdAndUpdate(frontendManager._id, {
      teamId: frontendTeam._id
    });

    await User.findByIdAndUpdate(rahul._id, {
      teamId: frontendTeam._id
    });

    await User.findByIdAndUpdate(aman._id, {
      teamId: frontendTeam._id
    });

    await User.findByIdAndUpdate(backendManager._id, {
      teamId: backendTeam._id
    });

    await User.findByIdAndUpdate(neha._id, {
      teamId: backendTeam._id
    });

    // PROJECTS
    const ecommerce = await Project.create({
      name: "E-Commerce Website",
      description: "Online shopping platform",
      teamId: frontendTeam._id
    });

    const adminDashboard = await Project.create({
      name: "Admin Dashboard",
      description: "Management dashboard",
      teamId: frontendTeam._id
    });

    const crmApi = await Project.create({
      name: "CRM API",
      description: "Customer management APIs",
      teamId: backendTeam._id
    });

    // TASKS
    const loginTask = await Task.create({
      title: "Login Page",
      description: "Build authentication screens",
      status: "todo",
      projectId: ecommerce._id,
      assignedTo: rahul._id
    });

    await Task.create({
      title: "Product Listing",
      description: "Create product grid",
      status: "in-progress",
      projectId: ecommerce._id,
      assignedTo: aman._id
    });

    await Task.create({
      title: "Cart Page",
      description: "Shopping cart functionality",
      status: "done",
      projectId: ecommerce._id,
      assignedTo: rahul._id
    });

    await Task.create({
      title: "Analytics Widget",
      description: "Dashboard charts",
      status: "review",
      projectId: adminDashboard._id,
      assignedTo: aman._id
    });

    await Task.create({
      title: "Customer CRUD API",
      description: "Customer endpoints",
      status: "done",
      projectId: crmApi._id,
      assignedTo: neha._id
    });

    // CHAT MESSAGES
    await Message.insertMany([
      {
        content: "Please complete the login page today.",
        senderId: frontendManager._id,
        teamId: frontendTeam._id
      },
      {
        content: "Working on it.",
        senderId: rahul._id,
        teamId: frontendTeam._id
      },
      {
        content: "Product listing is in progress.",
        senderId: aman._id,
        teamId: frontendTeam._id
      }
    ]);

    // ACTIVITY LOGS
    await ActivityLog.insertMany([
      {
        type: "Project Created",
        description: "Created E-Commerce Website project",
        user: "Priya Sharma",
        teamId: frontendTeam._id
      },
      {
        type: "Task Created",
        description: "Created Login Page task",
        user: "Gaurav Jain",
        teamId: frontendTeam._id
      },
      {
        type: "Task Assigned",
        description: "Assigned Login Page to Rahul Sharma",
        user: "Gaurav Jain",
        teamId: frontendTeam._id
      },
      {
        type: "Task Updated",
        description: "Moved Cart Page to Done",
        user: "Rahul Sharma",
        teamId: frontendTeam._id
      }
    ]);

    console.log("Seed completed successfully");
    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
