const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChecklistSchema = new Schema({
    object_domain:{type:String,required:true},
    object_id:{type:String,required:true},
    description:{type:String,required:true},
    due:{type:Date},
    urgency:{type:Number},
    task_id:{type:String},
    items:[
        {
            description:{type:String,required:true},
            due:{type:Date},
            urgency:{type:Number},
            asignee_id:{type:Number}
        }
    ]
});

module.exports = mongoose.model('checklist',ChecklistSchema);