const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    //! Jointure
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

/*taskSchema.pre('save', function (next) {
  next();
});*/

//! We didn't use middleware
const task = mongoose.model('Task', taskSchema);
module.exports = task;
