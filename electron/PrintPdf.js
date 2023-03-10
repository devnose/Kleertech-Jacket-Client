const { app, BrowserWindow, protocol, ipcMain, ipcRenderer } = require("electron");
const axios = require('axios').default;
const { channels } = require("../src/shared/constants");
const fs = require('fs');
const path = require("path");
const os = require('os');
const { resolve } = require("path");
const stream = require('stream');
const { exec } = require("child_process");
const { notification } = require("antd");
const { title } = require("process");
const { Notification } = require("electron/main");
const PDFMerger = require('pdf-merger-js');
const { MergeRounded } = require("@mui/icons-material");



const defaultPrinter = {
  printer: ""
}

console.log('fuckfuck')


Object.defineProperty(defaultPrinter, "getPrinter", {
    get : function () {
      return this.printer; 
    }
}); 

// setting property
Object.defineProperty(defaultPrinter, "setPrinter", {
  set : function (value) {
      this.printer = value;
  }
});




ipcMain.on(channels.GET_JACKET, (event, arg) => {
    console.log(arg);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(),  `print-kleer-`)); 
    console.log(tempDir)
    readPrintDir(tempDir,arg.directory, arg.username)

    
}); 


const makeTemp = async () => {

    fs.mkdtemp(path.join(os.tmpdir(), `print-29938-`), (err, folder) => {
         console.log(folder); 
        // readPrintDir(folder); 
            readPrintDir(folder); 
            
    }); 
}




const readPrintDir = async (tempDir,tenary,username) => {

  console.log(tempDir); 
  console.log(tenary); 
  console.log(username)

    const data = { dir: tempDir, directory: tenary, username: username, };
    axios.post("http://192.168.168.173:8090/readPrintDir", data).then((res) => {
      if (res.data.success) {
             const files = res.data.files; 
             var counter = 0; 
            for(var x = 0; x < files.length; x++){
                getConvertedPrintFiles(files[x], tempDir, files.length, tenary); 

            }
      //  getConvertedPrintFiles('20222415CO.pdf')

        const data = {
          username: username,
          action: `Printed Job Jacket: ${tenary}`,
        };
        axios.post("http://192.168.168.173:8090/logData", data).then((res) => {
        //   console.log(res);
        });
      }
  }); 
    
}; 

var x = 0; 
const getConvertedPrintFiles = async (fileName, tempDir, howManyFiles, tenary) => {


    //sends file name to backend to get data.  

    const receiveFile = await axios.request({
        method: 'GET',
        url: `http://192.168.168.173:8090/sendPdfs/${fileName}`,
        responseType: 'arraybuffer',
        responseEncoding: 'binary'

    }); 

    //writing the binary file data back to a file in temp directory 
    try {
        fs.writeFileSync(`${tempDir}\\${fileName}`, receiveFile.data);
        console.log('Success in writing file'); 
        ++x; 
        console.log(x)
        if(x == howManyFiles){
          console.log(true); 
          // sendToPrintQue(tempDir, tenary)
          MergePdfOrder(tempDir, tenary)
          x = 0; 
        }

      } catch (err) {
        console.log('Error in writing file')
        console.log(err)
      }

}


const MergePdfOrder = async(tempDir, tenary) => {
  var merger = new PDFMerger();


        var files = fs.readdirSync(tempDir); 
    

        for(var x = 0; x < files.length; x++){



               if(files[x].includes('co.pdf') || files[x].includes('CO.pdf')) {
                console.log(files[x])
                    await merger.add(tempDir+'//'+files[x]);      

               } else

                if(files[x].includes('oc.pdf') || files[x].includes('OC.pdf')){
                await merger.add(tempDir+'//'+files[x]); 
            
          } 


          // await merger.add(tempDir+'//'+files[x]); 



          

          
          // if(files[x].includes('oc.pdf') || files[x].includes('OC.pdf')){
          //   await merger.add(tempDir+'//'+files[x]); 
            
          // }
          // if(files[x].includes('co.pdf') || files[x].includes('CO.pdf')) {
          //   await merger.add(tempDir+'//'+files[x]);      
          //   await merger.add(tempDir+'//'+files[x]); 
          //      }

          //      if(!files[x].includes('co.pdf') || !files[x].includes('oc.pdf') || !files[x].includes('CO.pdf') || !files[x].includes('OC.pdf')){
          //           console.log(files[x]); 
          //           await merger.add(tempDir+'//'+files[x]); 
          //      }

          //      console.log(x +':'+files.length)

            
        }


        for(var x = 0; x < files.length; x++){
          if(files[x].includes('co.pdf') || files[x].includes('CO.pdf')) {
            await merger.add(tempDir+'//'+files[x]);    
          } else

          if(files[x].includes('oc.pdf') || files[x].includes('OC.pdf')){
          console.log('skip')
      
    } else {
      await merger.add(tempDir+'//'+files[x]);    

    }
            if( x+1 == files.length){
              console.log('done merging')
              await merger.save(tempDir+'//'+'merged.pdf'); 
              sendToPrintQue(tempDir)
                  // print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-dialog -print-to "${defaultPrinter.printer}" `+`"${tempDir}//merged.pdf" `); 

             }

       }
        }

   







const sendToPrintQue = (tempDir, tenary) => {

  showPrintNotification(tenary); 
  const username = os.userInfo().username; 
  setTimeout(() => {
    console.log(fs.readdirSync(tempDir))
    print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-dialog -print-to "${defaultPrinter.printer}" `+`"${tempDir}\\merged.pdf" `); 

  }, 5000);

//   var files = fs.readdirSync(tempDir)
//   console.log(files); 

//   // print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-dialog -print-to "${defaultPrinter.printer}" `+`"${tempDir}\\merged.pdf" `); 

//   var orderFiles = []; 

//   function setDelay(x){
//      setTimeout(() => {
//           print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-to "${defaultPrinter.printer}" `+`"${tempDir}\\${files[x]}"`); 

//         console.log(x)
//      }, 5000);
//   }

//   for(var x = 0; x < files.length; x++){

//  setDelay(x)

//     // setTimeout(() => {

//     // }, 3000);


//     // if(files[x].includes('co.pdf') || files[x].includes('CO.pdf')){

//     //   print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-to "${defaultPrinter.printer}" `+`"${tempDir}\\${files[x]}"`); 


       
//     // }


//     //     if(files[x].includes('oc.pdf') || files[x].includes('OC.pdf')){


//     //         print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-dialog -print-to "${defaultPrinter.printer}" `+`"${tempDir}\\${files[x]}" `); 

//     //     }

     

//     //       if(files[x].includes('msg.pdf')){

//     //           print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-to "${defaultPrinter.printer}" `+`"${tempDir}\\${files[x]}"`); 

              

//     //       }

//     //       if(files[x].includes('(attach).pdf')){

//     //         print(`cd C:\\Users\\${username}\\AppData\\Local\\SumatraPDF && SumatraPDF.exe -print-to "${defaultPrinter.printer}" `+`"${tempDir}\\${files[x]}"`); 

            

//     //     }
//       }
    }



const print = (arg) => {
  
  if(process.platform == 'win32'){
      exec(arg, {windowsHide: true}, (e) => {
        if(e){console.log(e); throw e}; 
      }); 
  }

    
}




const setPrinter = (userPrinter) => {
  console.log(userPrinter); 
  defaultPrinter.setPrinter = userPrinter
}

const showPrintNotification = async (tenary) => {
 axios.post('http://192.168.168.173/notify', {payload: `Printing ${tenary}`}).then(res => {console.log(res.data)}); 

}



module.exports = {setPrinter}