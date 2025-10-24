import mongoose from "mongoose";

const adminAuditSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  actorEmail: { type: String },
  action: { type: String, enum: ["promote", "demote"], required: true },
  target: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  targetEmail: { type: String },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const AdminAudit = mongoose.models.AdminAudit || mongoose.model("AdminAudit", adminAuditSchema);

export default AdminAudit;
