import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { saveRival } from "../src/rivalStorage";
export default function CreateRival() {
 const router=useRouter();const [name,setName]=useState("");const [personality,setPersonality]=useState("competitive");const [description,setDescription]=useState("");const [aggression,setAggression]=useState(50);const [busy,setBusy]=useState(false);
 const save=async()=>{if(!name.trim()||busy)return;setBusy(true);try{await saveRival({id:Date.now().toString(36)+Math.random().toString(36).slice(2),name:name.trim(),personality:personality.trim(),description:description.trim(),aggression,avatarUri:null,createdAt:Date.now()});router.replace("/")}finally{setBusy(false)}};
 const label={color:"#aaa",marginTop:18,marginBottom:6} as const;
 return <ScrollView style={{flex:1,backgroundColor:"#08080c"}} contentContainerStyle={{padding:24,paddingTop:60,paddingBottom:48}}>
  <Text style={{color:"#E50914",fontWeight:"800"}}>NEW RIVAL</Text><Text style={{color:"white",fontSize:30,fontWeight:"800",marginTop:8}}>Create your competition</Text>
  <Text style={label}>Name</Text><TextInput value={name} onChangeText={setName} maxLength={60} placeholder="Kai" placeholderTextColor="#666" style={{backgroundColor:"#1a1a20",color:"white",padding:16,borderRadius:12}}/>
  <Text style={label}>Personality</Text><TextInput value={personality} onChangeText={setPersonality} maxLength={60} placeholder="Confident, sarcastic..." placeholderTextColor="#666" style={{backgroundColor:"#1a1a20",color:"white",padding:16,borderRadius:12}}/>
  <Text style={label}>Character backstory and behavior</Text><TextInput multiline value={description} onChangeText={setDescription} maxLength={1000} placeholder="Describe who this rival is..." placeholderTextColor="#666" style={{backgroundColor:"#1a1a20",color:"white",padding:16,borderRadius:12,minHeight:100,textAlignVertical:"top"}}/>
  <Text style={label}>Aggression · {aggression}%</Text><View style={{flexDirection:"row",justifyContent:"space-between"}}>{[0,25,50,75,100].map(x=><TouchableOpacity key={x} onPress={()=>setAggression(x)} style={{backgroundColor:aggression===x?"#E50914":"#222",padding:12,borderRadius:10}}><Text style={{color:"white"}}>{x}</Text></TouchableOpacity>)}</View>
  <Text style={{color:"#777",marginTop:15}}>Custom avatar upload and fine-grained slider are coming next.</Text>
  <TouchableOpacity disabled={busy||!name.trim()} onPress={save} style={{backgroundColor:"#E50914",padding:18,borderRadius:12,marginTop:30,opacity:busy||!name.trim()?.5:1}}><Text style={{color:"white",fontWeight:"800",textAlign:"center"}}>Create Rival</Text></TouchableOpacity>
 </ScrollView>;
}