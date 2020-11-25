const { string } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChecklistSchema = new Schema({
    object_domain:{type:String,required:true},
    object_id:{type:String,required:true},
    description:{type:String,required:true},
    due:{type:Date},
    urgency:{type:Number},
    task_id:{type:String},
    is_completed:{type:Boolean,default:false},
    completed_at:{type:Date,default:null},
    created_at:{type:Date,default:new Date()},
    updated_at:{type:Date,default:new Date()},
    created_by:{type:String},
    updated_by:{type:String},
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