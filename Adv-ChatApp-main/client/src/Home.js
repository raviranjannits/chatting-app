import React,{useState,useEffect,useRef} from 'react';
import { FaViacoin } from "react-icons/fa";
import { toast } from "react-toastify";
import "./sass-css/style.css";
// import {GoogleLogin} from "react-google-login";
// import {gapi} from "gapi-script";
import io from 'socket.io-client';
import { BiSend } from "react-icons/bi";
import { IoSend } from "react-icons/io5";
import { IoIosAttach } from "react-icons/io";
// import FacebookLogin from 'react-facebook-login';
import useSound from 'use-sound';
import sentMusic from "./images/081723_fx-40246.mp3";
import receiveMusic from "./images/announcement-sound-4-21464.mp3";

const socket = io.connect("https://adv-chatapp.onrender.com", { transports: ['websocket', 'polling', 'flashsocket'] });
// const socket = io.connect("http://localhost:3001", { transports: ['websocket', 'polling', 'flashsocket'] });


const Home = () => {
    // const cliendId="720727109917-tqsj2lchhl7am49a5okrsm2qsjf5i4tr.apps.googleusercontent.com";
    // const cliendId="490453716320-idg3715vgcrrpb1q3gd9nf0nt13qcb9k.apps.googleusercontent.com";
    const [data,setData]=useState("");
    const [bigData, setBigData] = useState([]); //from get method
    const [logged,setLogged]=useState(false);
    
    const [sentPlay]=useSound(sentMusic);
    const [receivePlay]=useSound(receiveMusic);

    const [message,setMessage]=useState("");
    const [room,setRoom]=useState("");
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [messageReceived,setMessageReceived]=useState([]);
    const [messageSent,setMessageSent]=useState([]);

    useEffect(()=>{
        fetch("https://adv-chatapp.onrender.com").then(res => res.json()).then(res_data =>{
            setBigData(res_data);
            console.log(res_data);
        })
    },[])

    const handleLogin=(res)=>{
        const loginData=bigData.find(data =>{
            if(data.room === room){
                return data
            }
        })
        console.log(loginData);
        if(room ===""){
            toast.error("Room no is required");
        }
        else if(loginData && password !== loginData.password){
            toast.info("Enter correct password or create your unique room")
            toast.error("Incorrect Password");
        }
        else{
            setData({username,password,room});
            setLogged(true);
            toast.success(`Login successful to room - ${room}`);
            // joinRoom();
        }
    }

    useEffect(()=>{
        joinRoom();
    },[data])


    const sendMessage =()=>{
        var time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
        socket.emit('send_message',{message:message.trim(),room,id:socket.id,username:data.username,time});
        socket.emit('sended_message',{message:message.trim(),id:socket.id,username:data.username,time});
        document.querySelector("#message").value="";
        setMessage("");
        sentPlay();
    }

    const joinRoom =()=>{
        // setMessageReceived([]);
        var time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
        socket.emit('join_room',{room,id:socket.id,username:data.username,time,message:"",password});      
        // document.querySelector("#roomNo").value="";
        receivePlay();
        bigData.filter((element)=> element.room === room).map((element)=>{
            setMessageReceived((messageReceived)=>{
                return [...messageReceived,{...element,value:element.message}];
            });
        })
    }
    const handleLogout=()=>{
        setMessageReceived([]);
        // setdata("");
        var time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
        socket.emit('log_out',{room,id:socket.id,username:data.username,time,message:"#admin.logout"});
        setLogged(false);
        // window.location.reload();
    }

    useEffect(()=>{
        // console.log("0effect");
        socket.on("receive_message",(data)=>{
            var newInfo = {key:new Date().getTime().toString(),value:data.message,id:data.id,time:data.time,username:data.username};
            console.log(newInfo);
            setTimeout(() => {
                var obj_div = document.querySelector(".msg_wrap");
                obj_div.scrollTop=obj_div.scrollHeight;   //imp*
            }, 10);
          // console.log(messageReceived);
            setMessageReceived((messageReceived)=>{
            return [...messageReceived,newInfo];
            });
            // toast.info("Message Received");
        })
    },[socket])
    useEffect(()=>{
        // console.log("0effect");
        socket.on("message_sent",(data)=>{
            var newInfo = {key:new Date().getTime().toString(),value:data.message,time:data.time,image:data.image,username:data.username};
            console.log("sending",newInfo);
            setTimeout(() => {
                var obj_div = document.querySelector(".msg_wrap");
                obj_div.scrollTop=obj_div.scrollHeight;
            }, 10);
          // console.log(messageReceived);
            setMessageReceived((messageReceived)=>{
            return [...messageReceived,newInfo];
            });
            // toast.info("Sent");
        })
    },[socket])

    return (
    <div className="home">
        <div className="card">
            <div className="title">
                <span>Varta</span>
            </div>
            {!logged &&
            <div className="login">
                <input type="text" placeholder="Username" onChange={(e)=>setUsername(e.target.value)}/>
                <input type="text" placeholder="Room no." onChange={(e)=>setRoom(e.target.value)}/>
                <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
                <button id="btn" onClick={handleLogin}>Join</button>
            </div>}
            {logged && <div className="chat">
                <div className="liveChat">
                    <p>Live Chat</p>
                    <h6>{data.username}</h6>
                    <button onClick={handleLogout} className="logout">Log out</button>
                </div>
                <div className="msg_wrap">
                    {!messageReceived ? null : messageReceived.map(({key,value,id,time,username,image}) =>{
                    if(value === "" && username){
                        return (
                        <div key={key}>
                            <div className="join">{username} joined the room at {time}</div>
                        </div >
                        )
                    }
                    if(value === "#admin.logout"){
                        return (
                        <div key={key}>
                            <div className="join">{username} left the room at {time}</div>
                        </div >
                        )
                    }
                    if(data.username !== username && value !==""){
                        return (
                            <div key={key} className="left">
                                <div className="first">
                                    {/* <img src={`${image}`} alt="img" /> */}
                                    <div>
                                        <p className="username">{username}</p>
                                        <div>{value}</div>
                                        <p className="time">{time} </p>
                                    </div>
                                </div>
                            </div >
                        )
                        }
                    else if (data.username === username && value !==""){
                        return (
                            <div key={key} className="right">
                                <div className="first">
                                    <div>
                                        <p className="username">you</p>
                                        <div>{value}</div>
                                        <p className="time">{time} </p>
                                    </div>
                                    {/* <img src={`${image}`} alt="img" /> */}
                                </div >
                            </div>
                        )
                    }
                    }) }
                </div>
                <div className="send">
                    <form onSubmit={sendMessage}>
                        <input type="text" placeholder="Message..." id="message" onChange={(e)=>{
                            setMessage(e.target.value);
                        }} className="message_input" required/>
                        {/* <div className="file_input">
                            <input type="file" name="file" id="file"/>
                            <a href="javascript: void(0)"><IoIosAttach/></a>
                        </div> */}
                        {message.length >0 ?
                        <button onClick={sendMessage}><IoSend/></button>:
                        <button><BiSend/></button>}
                    </form>
                </div>
            </div> }
        </div>
    </div>
    )
}

export default Home;
