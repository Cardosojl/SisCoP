const express =  require('express');
const mongoose = require('mongoose');
const {DocumentManipulator, uploadFile} = require('../../models/document_reader/DocumentManipulator');
require('../../models/document_reader/ProcessDB');
require('../../models/document_reader/ProcessStateDB')
const Process = mongoose.model('process');
const ProcessState = mongoose.model('processstate');

const router = express.Router();

router.get('/', (req, res) => {      
    res.render('document_reader/process');
});

router.post('/:year', (req,res) => {   //done
    Process.find({user: res.locals.id}).where({year: req.params.year}).lean().then((process) => {       
        res.send(JSON.stringify(process))
    }).catch((error) =>{
        res.send(error);
    });    
});

router.post('/:year/edit/:link', (req, res) =>{ //DONE
    try {        
        Process.updateOne({_id: req.body.elementid}, {$set: {title: req.body.ename, user_dir: `${req.params.link.split('_')[0]}_${req.body.ename}`}}).lean().then(() =>{                
            DocumentManipulator.rename(`upload/inProcess/${req.params.year}/${req.params.link}`,
            `upload/inProcess/${req.params.year}/${req.params.link.split('_')[0]}_${req.body.ename}`);
            res.redirect(`/meusprocessos/`);                
        });                 
    } catch (error) {
        res.send('error' + error)        
    }
});

router.post('/:year/delete/:link', (req, res) => { //DONE
    try {        
        Process.findOne({_id: req.body.elementid}).then((process) => {
            if(process.receiver == null && process.section_receiver == null && process.done == false){
                ProcessState.deleteMany({process: req.body.elementid}). then(() =>{}).catch((error) => {
                    console.log('Erro: ' + error)
                });
                Process.deleteOne(process).then(() => {                        
                    DocumentManipulator.removeProcess(`upload/inProcess/${req.params.year}/${req.params.link}`);
                    res.redirect(`/meusprocessos/`);
                }).catch((error) =>{
                    res.send(error);
                });                    
            }else{
                Process.updateOne({_id: process._id}, {$set: {user: null, user_dir: null}}).then(() =>{
                    DocumentManipulator.removeProcess(`upload/inProcess/${req.params.year}/${req.params.link}`);
                    res.redirect(`/meusprocessos/`);
                }).catch((error) => {
                    console.log(error);
                    res.send('Erro: ' + error)
                });               
            }
        }).catch((error) => {
            console.log(error);
            res.send('Erro: ' + error);
        })            
                   
    } catch (error) {
        res.send('error' + error)        
    }
});

router.post('/:year/:link', (req, res) =>{ //DONE
    let documents;
    try {       
        Process.findOne({user_dir: req.params.link}).lean().then((process) => {
            ProcessState.find({process: process}).lean().then((states) => {                
                let message = req.session.error || null; //mudar isso
                req.session.error = null
                documents = DocumentManipulator.readDir(`upload/inProcess/${req.params.year}/${req.params.link}`);
                res.render('document_reader/documents', {process: process, documents: documents, error: message, states: states});

            }).catch((error) => {
                res.send('Erro: ' + error);
            })
        }).catch((error) => {
            res.send('Erro: ' + error);
        });            
    } catch (error){
        res.redirect('/');
    }    
});

router.post('/:year/:link/edit/:file', (req, res) => {
    try {        
        let fileExtension = req.params.file.split('.');
        fileExtension = fileExtension[fileExtension.length -1];
        DocumentManipulator.rename(`upload/inProcess/${req.params.year}/${req.params.link}/${req.params.file}`,
        `upload/inProcess/${req.params.year}/${req.params.link}/${req.body.ename}.${fileExtension}`);
        res.redirect(307, `/meusprocessos/${req.params.year}/${req.params.link}`);       
    } catch (error) {
        res.send('error' + error)        
    }
});

router.post('/:year/:link/delete/:file', (req, res) => {
    try {        
        let fileExtension = req.params.file.split('.');
        fileExtension = fileExtension[fileExtension.length -1];
        DocumentManipulator.removeDocument(`upload/inProcess/${req.params.year}/${req.params.link}/${req.params.file}`);
        res.redirect(307, `/meusprocessos/${req.params.year}/${req.params.link}`);       
    } catch (error) {
        res.send('error' + error)        
    }
});

router.post('/:year/:link/:file', (req, res) =>{
    try {        
        let doc = DocumentManipulator.readDocument(`upload/inProcess/${req.params.year}/${req.params.link}/${req.params.file}`);
        res.end(doc);               
    } catch (error) {
        res.redirect('/');      
    }    
});

router.post('/:year/:link/upload/:local/', uploadFile,(req,res) =>{
    try {                                     
        res.redirect(307, `/meusprocessos/${req.params.year}/${req.params.link}`);               
    } catch (error) {        
        res.redirect(301, `/meusprocessos/${req.params.year}/${req.params.link}`, {error: error})       
    }        
});

router.get('/:year/:link/anotation/:title', (req,res) => {    
    try {                                      
        res.render('document_reader/anotation', {title: req.params.title, year: req.params.year, link: req.params.link, baseurl: req.baseUrl});               
    } catch (error) {
        res.redirect('/');        
    }            
});

router.post('/:year/:link/anotation/:title', (req,res) => {
    Process.findOne({user_dir: req.params.link}).lean().then((process) => {
        const State = {
            process: process,
            state: req.body.state,
            anotation: req.body.anotation,
            date: Intl.DateTimeFormat('pt-BR', { dateStyle: "full", timeStyle: "short" }).format(new Date())
        }
        new ProcessState(State).save().then(() =>{
            res.redirect(307, `/meusprocessos/${req.params.year}/${req.params.link}`)
        }).catch((error) =>{
            res.send('Erro: ' + error);
        }) 
    }).catch((error) => {
        res.send('Erro: ' + error);
    });          
});

router.post('/:year/:link/anotation/:title/delete', (req,res) => {
    try {       
        ProcessState.deleteOne({_id: req.body.elementid}). then(() =>{
            res.redirect(307, `/meusprocessos/${req.params.year}/${req.params.link}`)

        }).catch((error) => {
            console.log('Erro: ' + error)
        });                  
    } catch (error) {
        res.send('error' + error)        
    }

});

module.exports= router;