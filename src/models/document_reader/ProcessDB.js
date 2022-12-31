const mongoose = require('mongoose');
const Schema =  mongoose.Schema;

const Process =  new Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',        
    },
    receiver:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    section_receiver: {
        type: String,
    },
    done:{
        type: Boolean,
        default: false     
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    description: {
        type: String
    },
    user_dir:{
        type:  String,
        required: true        
    },
    transfer_dir:{
        type: String        
    },
    done_dir:{
        type: String        
    },
    date: {
        type: String,
        required: true            
    },
    year: {
        type: String,
        required: true
    }    
});

mongoose.model('process', Process);
