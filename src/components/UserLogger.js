// import React from 'react';
// import '../App.css'
// import {Modal, Button} from "antd";



// export default class UserLogger extends React.Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             logger: []
//         }
//     }



//    async componentDidMount() {
//         setInterval(()=>{

//             this.fetch()

//         },3000)

//     }

//     componentWillUnmount() {
//         clearInterval(this.timer);
//     }
  

//     async fetch() {
//         var context = this;
//         const res = await fetch('http://192.168.168.173:8090/log'); 
//         const data = await res.json(); 
//     //    / console.log(data[0].Username)
//           context.setState({logger: data.reverse()})

        
          
//         }

    

//     render(){
//         return(

//             <Modal maskClosable={false}
//             onCancel={onCan}
//             visible={visible}
//             width={"70%"}
//             bodyStyle={{height: 800, overflowY: 'auto'}}
//             style={{ top: 20 }}
//             footer={footer}>

//             <div className='logger'>
//                 {this.state.logger.length > 0 && (
//                     <div>
//                     {this.state.logger.map((logger) => (
                              
//                                  <p className='fade-in' >{logger['Date'] + logger['Username']+' '+logger['Action']} </p>
                               
//                     ))}
//                     </div>
//                 )}
//             </div>
//             </Modal>
//         )
//     }
// }

