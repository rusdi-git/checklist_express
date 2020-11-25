const express = require("express");
const router = express.Router();
const Checklist = require("../models/checklist");
const Joi = require("joi");

const schema = Joi.object({
    object_domain:Joi.string().required(),
    object_id:Joi.string().required(),
    description:Joi.string().required(),
    due:Joi.date(),
    urgency:Joi.number(),
    task_id:Joi.string().allow(''),
    items:Joi.array().items(Joi.string().required())
});

const schemaUpdate = Joi.object({
    object_domain:Joi.string(),
    object_id:Joi.string(),
    description:Joi.string(),
    due:Joi.date(),
    urgency:Joi.number(),
    task_id:Joi.string().allow('')
});

const generateLink = (req,id) => {
    if(req) {
        let result = req.hostname+req.originalUrl;
        result = result + "/"+id;
        return result;
    } else {
        return null;
    }
}

const serializeChecklist =(data,includeItems=false,req=null)=>{
    if(Array.isArray(data)) {
        const result = data.map(item=>serializeChecklist(item,includeItems,req));
        return result;
    } else {
        const result = {
            id:data._id,
            type:"checklist",
            attributes:{
                object_domain:data.object_domain,
                object_id:data.object_id,
                description:data.description,
                due:data.due,
                urgency:data.urgency,
                task_id:data.task_id,
                is_completed:data.is_completed,
                completed_at:data.completed_at,
                created_at:data.created_at,
                updated_at:data.updated_at,
                created_by:data.created_by,
                updated_by:data.updated_by,
            },
        links:{
            self:generateLink(req,data._id)
        },
        }
        if(includeItems) {
            const items = data.items.map((item)=>({
                description:item.description,
                due_date:item.due_date,
                urgency:item.urgency,
            }));
            result.attributes.items = data.items;
        }
        return result;
    }
};

const generateResponse = (data)=>{return {data:data}};

router.post("/", async (req, res) => {
    const data = req.body.data.attributes;
    const user = req.user;
    const {error,value} = schema.validate(data);
    if(error) {
        return res.status(400).json({status:400,error:'Validation Failed'});
    } else {
        const added_items = [];
        for (const item of value.items) {
            added_items.push({description:item,due:value.due,urgency:value.urgency});
        }
        value.items = added_items;
        value.created_by = user;
        value.updated_by = user;
        const checklist = new Checklist(value);
        try {
            const result = await checklist.save();
            const response = serializeChecklist(result,false,req);
            return res.status(201).json(generateResponse(response));
        } catch (error) {
            return res.status(400).json("Error"+error);
        }
    }
});

router.get("/",async (req,res) => {
    try {
        const checklists = await Checklist.find();
        const response = serializeChecklist(checklists,false,req);
        return res.json(generateResponse(response));
    } catch (error) {
        return res.status(400).json("Error"+error);
    }
});

router.get("/:id",async (req,res) => {
    try {
        const params = req.params;
        const checklist = await Checklist.findOne({_id:params.id});
        const response = serializeChecklist(checklist,false,req);
        return res.json(generateResponse(response));
    } catch (error) {
        return res.status(400).json("Error"+error);
    }
});

router.patch("/:id",async (req,res)=>{
    const params = req.params;
    const data = req.body.data.attributes;
    const {error,value} = schemaUpdate.validate(data);
    if(error) {
        console.log(error);
        return res.status(400).json({status:400,error:'Validation Failed'});
    } else {
        try {
            const update = await Checklist.updateOne({_id:params.id},value);
            if(update.ok) {
                const checklist = await Checklist.findOne({_id:params.id});
                const response = serializeChecklist(checklist,false,req);
                return res.json(generateResponse(response));
            } else {
                return res.status(400).json({error:'Update Failed.'});
            }
        } catch (error) {
            return res.status(400).json("Error"+error);
        }
    }
});

router.delete("/:id",async (req,res)=>{
    const params = req.params;
    try {
        const response = await Checklist.deleteOne({_id:params.id});
        if(response.ok===1){
            return res.status(204);
        } else {
            return res.status(400).json({error:"Deletion Failed."})
        }        
    } catch (error) {
        return res.status(400).json("Error"+error);
    }
});

router.get("/:checklistId/items", async (req,res)=>{
    const params = req.params;
    try {
        const checklist = await Checklist.find({_id:param.checklistId});
        const response = serializeChecklist(checklist,true);
        return res.json(generateResponse(response));
    } catch (error) {
        return res.status(400).json("Error"+error);
    }
});


module.exports = router;