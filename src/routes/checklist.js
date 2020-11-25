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

const serializeChekclist =(data,includeItems=false)=>{
    if(Array.isArray(data)) {
        const result = data.map(item=>serializeChekclist(item));
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
                task_id:data.task_id
            }
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

router.post("/", async (req, res) => {
    const data = req.body.data.attributes;
    const {error,value} = schema.validate(data);
    if(error) {
        return res.status(400).json({status:400,error:'Validation Failed'});
    } else {
        const added_items = [];
        for (const item of value.items) {
            added_items.push({description:item,due:value.due,urgency:value.urgency});
        }
        value.items = added_items;
        const checklist = new Checklist(value);
        try {
            const result = await checklist.save();
            const response = serializeChekclist(result);
            return res.json(response).status(200);   
        } catch (error) {
            return res.status(400).json("Error"+error);
        }
    }
});

router.get("/",async (req,res) => {
    try {
        const checklists = await Checklist.find();
        const response = serializeChekclist(checklists);
        return res.json(response);
    } catch (error) {
        return res.status(400).json("Error"+error);
    }
});

router.get("/:id",async (req,res) => {
    try {
        const params = req.params;
        const checklist = await Checklist.findOne({_id:params.id});
        const response = serializeChekclist(checklist);
        return res.json(response);
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
                const response = serializeChekclist(checklist);
                return res.json(response);
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

// router.get("/:checklistId/items", async (req,res)=>{
//     const params = req.params;
//     try {

//     }
// });


module.exports = router;