import React, { useEffect,useRef } from "react";
import LoadingBar from 'react-top-loading-bar'
import RemoteFileSystemProvider from "devextreme/file_management/remote_provider";
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css";
import FileManager, {
  FileSelectionItem,
  Item,
  Permissions,
  Toolbar,
  ItemView,
  Column,
  Details,
  ContextMenu,
  Notifications,
  ContextMenuItem,
} from "devextreme-react/file-manager";
import { channels } from "./shared/constants";
import UserLogger from "./components/ModalLogger";
import "devextreme/ui/button";
import "devextreme/dist/css/dx.light.css";

import useWindowSize from "./Utilities/useWindowSize";

import NewViewer from "./components/NewViewer";
import DocxViewer from "./components/DocxViewer";
import ChatMessage from "./components/Messenger/Messenger";


const development = true; 

const production = development ? "http://localhost:8090/" : "http://192.168.168.173:8090/"

   
const axios = require("axios").default;
const { ipcRenderer } = window.require("electron");
const remoteFileProvider = new RemoteFileSystemProvider({
  endpointUrl: production+"start",
});

//global variables
var username;
var path;
const isDesktopResolution = window.screen.height < 600


//recieving username from backend electron
ipcRenderer.send(channels.GET_USER, "love");
ipcRenderer.on(channels.GET_USER, (event, arg) => {
  username = arg;
});


ipcRenderer.send(channels.UPLOAD_FILE, "hey");

//Get docx data from backend
function readDocsFromExpress(str) {
  const promise = axios.get(production+`docx/${str}`);
  const dataPromise = promise.then((response) => response.data);
  return dataPromise;
}



//class file compoenent
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPdf: false,
      setShowPdf: false,
      showDocx: false,
      setShowDocx: false,
      showMsg: false,
      setShowMsg: false,
      showLogger: false, 
      setShowLogger: false,
      getPdf: [],
      setGetPdf: [],
      getDocx: [],
      setGetDocx: [],
      getAttatchment: [],
      setGetAttatchment: [],
      getMsg: [],
      setGetMsg: [],
      data: [],
      setData: [],
      getHtml: "",
      setHtml: "",
      initialData: "",
      progress: 0, 
      setProgress: 0,
      setDiv: false, 
      div: false
     
    };

    this.fileManagerRef = React.createRef();


    this.loggerViewer = {
      items: [
        {
          text: "View Logs", 
          icon: "columnchooser"
        }, 
        {
          text: "View Chats",
          icon: "message"
        }
      ],
      onItemClick: this.onItemClick.bind(this),
    }; 



    

    
    this.confirmationMenuOptions = {
      items: [
        {
          text: "Send Confirmation",
          icon: "check",
        },
      ],
      onItemClick: this.onItemClick.bind(this),
    };

    this.jobjacketMenuOption = {
      items: [
        {
          text: "Print Job Jacket",
          icon: "print",
        },
      ],
      onItemClick: this.onItemClick.bind(this),
    };

    this.onItemClick = this.onItemClick.bind(this);
  }

  //set PDF FILE from backend
  setPdfFile = (file) => {
    if (file.indexOf('"') >= 0) {
      var str = file.replace(/"/g, "");
      this.setState(
        {
          setGetPdf: production+ `pdf/${str}`,
          getPdf: production+`pdf/${str}`,
        },
        () => {
          console.log(str);
          return str;
        }
      );
    }
  };

  //Set docx data from backend
  setDocxFile = (file) => {
    if (file.indexOf('"') >= 0) {
      var str = file.replace(/"/g, "");
      readDocsFromExpress(str).then((data) => {
        this.setState({
          setGetDocx: <h1>{data}</h1>,
          getDocx: <h1>{data}</h1>,
        });
      });
    }
  };

  setAttachmentFile = (file) => {
    if (file.indexOf('"') >= 0) {
      var str = file.replace(/"/g, "");
      // this.setState({ setGetAttatchment: production+`attachment/${str}`, getAttatchment: production+ `attachment/${str}`}, () => {
      this.setState({
        setGetMsg: production+ `msg/${str}`,
        getMsg: production+`msg/${str}`,
      });
      this.fileManager.refresh(3000);
      this.setState({ setShowMsg: true, showMsg: true });

      // });
    }
  };

  // When a file is selected this function is fired
  fileManager_onSelectedFileOpened = (e) => {
    this.fileManager.refresh();

    //send path to backend
    axios.post(production+"dir", e["file"]).then((res) => {
      console.log(res);
    });

    //get object and find the file name
    var filename = JSON.stringify(e["file"]["name"]);
    //check to see if file has .pdf
    if (filename.includes(".pdf")) {
      //show Modal if pdf is oopened;
      this.setState({ setShowPdf: true, showPdf: true });
      this.setPdfFile(filename);

      //check to see if file is .DOCX
    } else if (filename.includes(".docx")) {
      //open the modal and set data
      this.setState({ setShowDocx: true, showDocx: true });
      this.setDocxFile(filename);

      //check to see if file is .MSG
    } else if (filename.includes(".msg")) {
      this.setAttachmentFile(filename);
      console.log(true);
    }

    // send log data
    const data = {
      username: username,
      action: "Opened file" + filename,
    };

    axios.post(production+"logData", data).then((res) => {
      console.log(res);
    });
    //send filename to backend for printing
    var to = JSON.stringify(e["file"]["relativeName"]);
    ipcRenderer.send(channels.GET_DIRECT, to.replace(/"/g, ""));
  };

  //file uploading [NON WORKING]
  onFileUploading = (e) => {
    
    ipcRenderer.send(channels.UPLOAD_FILE, e.fileData.path);
    this.setState({ setProgress: 10, progress: 10});       
      this.setState({ setProgress: 20, progress: 20});       
      this.setState({ setProgress: 30, progress: 30});       
        this.setState({ setProgress: 40, progress: 40});       
      this.setState({ setProgress: 50, progress: 50});       
      this.setState({ setProgress: 60, progress: 60});       
      this.setState({ setProgress: 70, progress: 70});       
      this.setState({ setProgress: 100, progress: 100});    
        
    this.fileManager.refresh(); 

    // axios.post(production+"upload", file, {
    //   headers: { 

    //     'Content-Length': stat.size, 
    //     'Content-Type': e.fileData.type, 
    //     'Content-Disposition': `attachement; filename=${e.fileData.name}`

    //   }
    // }).then((res) => {
    //   console.log(res);
    // });
  };

  onFileUploaded = (e) => {
    console.log(e); 
  }

  // file Deletion [NON WORKING]
  onItemDeleting = (e) => {
    console.log(e.item);
    console.log(e)
    this.onItemDeleted(e)
    
  };

  onItemDeleted = (e) => {
    console.log(e.item);
    this.setState({ setProgress: 10, progress: 10});       
    this.setState({ setProgress: 20, progress: 20});       
    this.setState({ setProgress: 30, progress: 30});       
      this.setState({ setProgress: 40, progress: 40});       
    this.setState({ setProgress: 50, progress: 50});       
    this.setState({ setProgress: 60, progress: 60});       
    this.setState({ setProgress: 70, progress: 70});       
    this.setState({ setProgress: 100, progress: 100});    
      
  this.fileManager.refresh(); 
  };


  directoryCreated = (e) => {
    const name = e.name ; 
    const dir = 'P://'+e.parentDirectory.path; 
    const data = {name: name, directory: dir}
    
    axios.post(production+"create", data).then((res) => {
      console.log(res);

      if(res.status == 200){

        this.fileManager.refresh(); 
      }
    });

    //send to backend for creting directory. 
    // have name of directory
    // have the directory path 



  }

  //Any items on the menu that has been clicked.
  // onContextMenuItemClick = (e) => {
  //   //gets selection path thats directory
  //   var pathSelection = path["selectedItems"][0].path;
  //   //gets selection path thats not a directory
  //   var nonDirSelection = path["selectedItems"][0].parentPath;

  //   //what menu item was clicked?
  //   console.log(e);
  //   if (e["itemData"]["options"]["items"][0].text == "Send Confirmation") {
  //     if (path["selectedItems"][0]["pathKeys"].length > 2) {
  //       if (path["selectedItems"][0].isDirectory) {
  //         const data = {
  //           directory: pathSelection,
  //           username: username,
  //           action:
  //             "Order Confirmation Sent for job# " +
  //             path["currentSelectedItemKeys"],
  //         };
  //         axios.post(production+"confirm", data).then((res) => {
  //           if (res.data) {
  //             alert("Order Has been confirmed by someone else");
  //           } else {
  //             alert("Order Confirmation Sent");
  //           }
  //         });
  //       } else {
  //         const data = {
  //           directory: nonDirSelection,
  //           username: username,
  //           action:
  //             "Order Confirmation Sent for job# " +
  //             path["selectedItems"][0]["pathKeys"][2],
  //         };
  //         axios.post(production+"confirm", data).then((res) => {
  //           if (res.data) {
  //             alert("Order Has been confirmed by someone else");
  //           } else {
  //             alert("Order Confirmation Sent");
  //           }
  //         });

  //         console.log("nondirectory");
  //         setTimeout(() => {
  //           this.fileManager.refresh();
  //         }, 2000);
  //       }

  //       //axios.post(production+'confirm', data).then(res => { console.log(res) })
  //     } else {
  //       alert("Cannot Send Confirmation from this directory");
  //     }
  //   }

  //   if (e["itemData"]["options"]["items"][0].text == "Print Job Jacket") {
  //     console.log("job jacket print");
  //   }
  // };

  onSelect = (e) => {
    console.log(e);
    path = e;
  };


divShowHide = (e) => {
  this.setState({ setDiv: !this.state.div }); 

  }

  // onCurrentDirectoryChanged = (e) => {
  //   this.fileManager.refresh()
  // }


   id = async () => {
    const res =  await axios.get(production+'api/user/'+username); 
    console.log('restest: '+res.data[0].tokenId);
    return Promise.resolve(res.data[0].tokenId)
  
  }


  render() {

    if(window.matchMedia("max-height: 600px").matches){
      this.setState({ setDiv: !this.state.div}); 
    }
  

    return (
      <div className="main">

        <LoadingBar color="#50C878	" height={5} progress={this.state.progress} shadow={true} onLoaderFinished={() => this.setState({setProgress: 0, progress: 0})} loaderSpeed={2000} waitingTime={2000}/>

      <div className="tophalf">

        <FileManager
        height={'100vh'}
          ref={this.fileManagerRef}
          onCurrentDirectoryChanged={this.onCurrentDirectoryChanged}
          fileSystemProvider={remoteFileProvider}
          onSelectedFileOpened={this.fileManager_onSelectedFileOpened}
          //onToolbarItemClick={this.onContextMenuItemClick}
          onContextMenuItemClick={this.onItemClick}
          onFileUploading={this.onFileUploading}
          onFileUploaded={this.onFileUploaded}
          onInitialized={this.onInitialized}
          onItemDeleted={this.onItemDeleted}
          onItemDeleting={this.onItemDeleting}
          onSelectionChanged={this.onSelect}
          onDirectoryCreating={this.directoryCreated}
          
          
        >


          <Permissions
            create={true}
            copy={true}
            move={true}
            delete={true}
            rename={true}
            upload={true}
            download={true}
          ></Permissions>

          <Notifications
          showPanel={false}
          showPopup={false}
          />
          
          
          <ItemView showParentFolder={false}>
            <Details>
              <Column dataField="thumbnail"></Column>
              <Column dataField="name" width="800"> </Column>
              <Column dataField="confirm" caption="Order Confirmed" width="180"></Column>
              <Column dataField="created" caption="Job Jacket Created " width="130"></Column>
              <Column dataField="rushed" caption="Rushed Order" width="120"></Column>

            </Details>
          </ItemView>
          <Toolbar>

          <onContextMenuItemClick>
            <ContextMenu>
              <ContextMenuItem
              items={"create"}
              text="creating">

              </ContextMenuItem>
            </ContextMenu>
          </onContextMenuItemClick>
            

            

  
            <FileSelectionItem
              widget="dxMenu"
              location="before"
              options={this.confirmationMenuOptions}
            />
                        <FileSelectionItem name="separator" />

            <FileSelectionItem
              widget="dxMenu"
              location="before"
              options={this.jobjacketMenuOption}
              
            />

            <FileSelectionItem
              widget="dxMenu"
              location="after"
              options={this.loggerViewer}
              />

              <Item
              widget={"dxMenu"}
              location="before"
              options={this.loggerViewer}
              />


            <FileSelectionItem name=
            "refresh" />
            <FileSelectionItem name="clearSelection" />
          </Toolbar>
          <ContextMenu>

          <Item name="create" />
          <Item name="delete" />
          <Item text="Send Confirmation" icon="plus"/>
          <Item text="Print Job Jacket" icon="print"/>


          </ContextMenu>
        </FileManager>

        {/* <PdfViewer pdf={this.state.getPdf}
          onCancel={() => this.setState({ setShowPdf: false, showPdf: false })}
          visible={this.state.showPdf}
        
        /> */}

        <NewViewer
          pdf={this.state.getPdf}
          onCancel={() => this.setState({ setShowPdf: false, showPdf: false })}
          visible={this.state.showPdf}
        />

        <DocxViewer
          doc={this.state.getDocx}
          onCancel={() =>
            this.setState({ setShowDocx: false, showDocx: false })
          }
          visible={this.state.showDocx}
        />

        {/* <MsgViewer
          msg={this.state.getMsg}
          doc={this.state.getAttatchment}
          onCancel={() => this.setState({setShowMsg: false, showMsg: false})}
          visible={this.state.showMsg}/> */}
        <NewViewer
          pdf={this.state.getMsg}
          onCancel={() => this.setState({ setShowMsg: false, showMsg: false })}
          visible={this.state.showMsg}
        />

</div>

{/* <Button className="button">Clear Log</Button> */}



        <div id="content" className="down">
         
        <UserLogger
        onCancel={() => this.setState({setShowLogger: false, showLogger: false})}
        visible={this.state.showLogger}
        />
        </div>

        

      
      </div>
    );
  }

  get fileManager() {
    return this.fileManagerRef.current.instance;
  }

  

  

  onItemClick({ itemData, viewArea, fileSystemItem }) {
    console.log(itemData.text);

    if(itemData.text === "Send Confirmation"){
      var directory = this.fileManager.getCurrentDirectory()
      var tenary = path["selectedItems"].length == 0 ? directory.path : path["selectedItems"][0].path; 


      const data = {
        directory: tenary,
        username: username,
        action:
          "Order Confirmation Sent for job# " +
          tenary,
      };

      axios.post(production+"confirm", data).then((res) => {
        if (res.data) {
          alert("Order Has been confirmed by someone else");
        } else {
          alert("Order Confirmation Sent");
        }
      });

      setTimeout(() => {
        this.fileManager.refresh();
      }, 2000);

    }



    if (itemData.text === "Print Job Jacket") {
      var directory = this.fileManager.getCurrentDirectory()
      var tenary = path["selectedItems"].length == 0 ? directory.path : path["selectedItems"][0].path; 

      const printData = {
          directory: tenary,
          username: username
      }
    
     
      ipcRenderer.send(channels.GET_JACKET, printData);
      this.setState({ setProgress: 10, progress: 10});       
      this.setState({ setProgress: 20, progress: 20});       
      this.setState({ setProgress: 30, progress: 30});       
      setTimeout(() => {
        this.setState({ setProgress: 40, progress: 40});       
      this.setState({ setProgress: 50, progress: 50});       
      this.setState({ setProgress: 60, progress: 60});       
      this.setState({ setProgress: 70, progress: 70});       
      this.setState({ setProgress: 100, progress: 100});  

   
      
     

      (async () => {
        const _id = await this.id(); 
        const data = {tokenId: _id, payload: `Job Jacket ${tenary} printing`}
        axios.post(production+"notify", data).then((res) => {
          console.log(res.data); 
        })


      })()
        
      }, 3000);


         


      // ipcRenderer.on(channels.GET_JACKET, (event, arg) => {
      //   args = arg;
      //   console.log(args); 
      // });

  //     setTimeout(() => {
  //       alert(
  //         "WARNING: Your printing multiple documents to create a job jacket"
  //       );
  //       console.log(args);
  //       const data = { dir: args, directory: tenary, username: username, };
  //       axios.post(production+"readPrintDir", data).then((res) => {
  //         console.log(res.data);

  //         if (res.data.success) {
  //           ipcRenderer.send(channels.GET_JACKET, res.data);

  //           const data = {
  //             username: username,
  //             action: "Printed Job Jacket: #20222152 ",
  //           };
  //           axios.post(production+"logData", data).then((res) => {
  //             console.log(res);
  //           });
  //         }
  //       });
  //     }, 5000);
     }


      if(itemData.text == 'View Logs'){

        this.setState({ setShowLogger: true, showLogger: true });


      }
   }


}
export default App;
