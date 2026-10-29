import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getRivals, getHistory, saveHistory } from "../src/rivalStorage";
import { fetchRivalReply } from "../src/api/rivalApi";
export default function RivalRoom(){
 const {id}=useLocalSearchParams(); const router=useRouter(); const [rival,setRival]=useState(null),[messages,setMessages]=useState([]),[draft,setDraft]=useState(""),[sending,setSending]=useState(false),[error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{const rivals=await getRivals();const r=rivals.find(x=>x.id===id);const h=await getHistory(id);if(active){setRival(r||null);setMessages(h)}})();return()=>{active=false}},[id]);
 const send=async()=>{const msg=draft.trim();if(!msg||!rival||sending)return;setSending(true);setError("");setDraft("");const prior=messages;const next=[...prior,{sender:"you",text:msg}];setMessages(next);await saveHistory(id,next);try{const reply=await fetchRivalReply({rival,userText:msg,history:prior});const done=[...next,{sender:"rival",text:reply}];setMessages(done);await saveHistory(id,done)}catch(e){setError("Couldn't reach your rival. Check your server and try again.")}finally{setSending(false)}};
 return <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":undefined} style={{flex:1,backgroundColor:"#08080c",paddingTop:60}}>
  <TouchableOpacity onPress={()=>router.back()} style={{paddingHorizontal:20,paddingBottom:12}}><Text style={{color:"#aaa"}}>‹ All rivals</Text></TouchableOpacity>
  <Text style={{color:"white",fontSize:25,fontWeight:"800",paddingHorizontal:20}}>{rival?.name||"Loading..."}</Text><Text style={{color:"#999",paddingHorizontal:20,marginBottom:10}}>{rival?.personality||""} · {rival?.aggression??50}% intensity</Text>
  <ScrollView style={{flex:1,paddingHorizontal:16}}>{messages.map((m,i)=><View key={i} style={{alignSelf:m.sender==="you"?"flex-end":"flex-start",backgroundColor:m.sender==="you"?"#30303a":"#221319",padding:14,borderRadius:16,marginVertical:5,maxWidth:"85%"}}><Text style={{color:"white",fontSize:16}}>{m.text}</Text></View>)}{!messages.length&&<Text style={{color:"#777",marginTop:30,textAlign:"center"}}>Say hello. Your rivalry starts here.</Text>}</ScrollView>
  {!!error&&<Text style={{color:"#ff7777",paddingHorizontal:16}}>{error}</Text>}
  <View style={{flexDirection:"row",padding:14,gap:9}}><TextInput value={draft} onChangeText={setDraft} editable={!sending} placeholder="Message your rival..." placeholderTextColor="#777" style={{flex:1,backgroundColor:"#1a1a20",color:"white",borderRadius:14,paddingHorizontal:14}}/><TouchableOpacity onPress={send} disabled={sending} style={{padding:15,borderRadius:12,backgroundColor:"#E50914"}}><Text style={{color:"white",fontWeight:"800"}}>{sending?"...":"Send"}</Text></TouchableOpacity></View>
 </KeyboardAvoidingView>;
}