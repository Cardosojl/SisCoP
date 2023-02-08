import {createElements, createSelect, appendElements, setAttributes} from '/js/builders/elementsFunctions.js';
import {request} from '/js/builders/ajax.js';

window.addEventListener('load', () => {       
    getValues()
});

async function getValues(){
    try {
        const documents = await request({
            method: 'POST',
            url: document.URL,
            params: ''
        });       

        elementGenerator(documents);
        
    } catch (error) {
        console.log(error);        
    }    
}

function elementGenerator(documents){
    generateSelects(documents, 1)
    
    document.addEventListener('click', (e) => {
        const element = e.target;        
        const listDocuments = document.getElementById('listdocuments');
        if(element.id === 'createSelect'){
            e.preventDefault()
            const selects = (listDocuments.children.length/3);
            if(selects < 10){
                generateSelects(documents, selects+1)                                                    
            }
            if(!document.getElementById('deleteselect')){
                deleteSelect()
            }            
        }
        if(element.id === 'deleteselect'){
            e.preventDefault()                     
            const selects = (listDocuments.children.length/3);
            console.log(selects)
            if(selects > 1){
                for(let i = 0; i < 3; i++){
                   listDocuments.removeChild(listDocuments.lastChild);
                }
            }
            if(selects == 2){
                document.getElementById('divcreator').removeChild(element);
            }
        }
        if(element.id === 'submit'){
           
            document.getElementsByName('file').forEach(x => {
                if(x.value === ''){
                    e.preventDefault()
                    document.getElementById('message').innerHTML = 'Existem Campos em Branco'
                }
            })
            const form = document.getElementById('convertform');
            setAttributes(form, {method: 'POST', action: `/conversor/${documents.path.replace('upload', 'conversion')}`})
            
        }
        
    });  
}

function generateSelects(documents, index){
    const listDocuments = document.getElementById('listdocuments');
    const paths = ['']
    const files = ['']
    for(let document of documents.documents){
        paths.push(`${documents.path}/${document.name}`);
        files.push(document.name);
    }
    const select = createSelect(paths, files, '', 'file', index);       
    const label = createElements('label',{}, `Arquivo ${index} -`);
    appendElements(listDocuments, [label, select, createElements('br',{})]);    
}

function deleteSelect(){
    const button = createElements('button', {class: 'button', id: 'deleteselect'}, '&nbsp-&nbsp');
    appendElements(document.getElementById('divcreator'),[button]);
}