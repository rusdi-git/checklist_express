const express = require("express");
const checklist = require("../models/checklist");
const router = express.Router();
const Checklist = require("../models/checklist");
const Joi = require("joi");
const { response } = require("express");

const schema = Joi.object({
    object_domain:Joi.string().required(),
    object_id:Joi.string().required(),
    description:Joi.string().required(),
    due:Joi.date(),
    urgency:Joi.number(),
    task_id:Joi.string().allow(''),
    items:Joi.array().items(Joi.string().required())
});

const serializeChekclist =(data)=>{
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
        return result;
    }
};

router.post("/", async (req, res) => {
    const data = req.body.data.attributes;
    const {error,validatedData} = schema.validate(data);
    if(error) {
        return res.status(400).json({status:400,error:'Validation Failed'});
    } else {
        const added_items = [];
        for (const item of validatedData.items) {
            added_items.push({description:item,due:value.due,urgency:value.urgency});
        }
        validatedData.items = added_items;
        const checklist = new Checklist(validatedData);
        try {
            const result = await checklist.save();
            response = serializeChekclist(result);
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
        const data = req.body.data.attributes;
        const checklist = await Checklist.updateOne({_id:params.id},parseChecklist(data));
        const response = serializeChekclist(checklist);
        return res.json(response);
    } catch (error) {
        return res.status(400).json("Error"+error);
    }
});

router.patch("/:id",async (req,res)=>{
    const params = req.params;
    const data = req.body.data.attributes;
    const {error,validatedData} = schema.validate(data);
    if(error) {
        return res.status(400).json({status:400,error:'Validation Failed'});
    } else {
        try {
            const checklist = await Checklist.updateOne({_id:params.id},validatedData);            
            const response = serializeChekclist(checklist);
            return res.json(response);
        } catch (error) {
            return res.status(400).json("Error"+error);
        }
    }
});

router.delete("/:id",async (req,res)=>{
    const params = req.params;
    try {
        const checklist = await Checklist.deleteOne({_id:params.id},validatedData);
        const response = serializeChekclist(checklist);
        if(checklist.ok===1){
            return res.status(204);
        } else {
            return res.status(400).json({error:"Deletion Failed."})
        }        
    } catch (error) {
        return res.status(400).json("Error"+error);
    }
});

module.exports = router;