const fs=require('fs').promises
const path=require('path');



async function createFolder(){
    try{
        const folderPath=path.join(__dirname,'../migratiobs')
        await fs.mkdir(folderPath,{recursive:true})
    }catch(err){
        console.log(err)
    }
}



module.exports={
    createFolder
}