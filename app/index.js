import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getRivals } from "./src/rivalStorage";
export default function Home() {
 const router=useRouter(); const [rivals,setRivals]=useState([]);
 useFocusEffect(useCallback(()=>{let active=true;getRivals().then(r=>{if(active)setRivals(r)});return()=>{active=false}},[]));
 return <View style={{flex:1,backgroundColor:"#08080c",padding:24,paddingTop:62}}>
  <Text style={{color:"#E50914",fontSize:13,fontWeight:"800"}}>RIVAL AI · REBIRTH</Text>
  <Text style={{color:"white",fontSize:32,fontWeight:"800",marginTop:10}}>Your Rivals</Text>
  <Text style={{color:"#999",marginTop:6,marginBottom:25}}>Every rival has a story. Every conversation is yours.</Text>
  <ScrollView>{rivals.map(r=><TouchableOpacity key={r.id} onPress={()=>router.push({pathname:"/rival/room",params:{id:r.id}})} style={{backgroundColor:"#17171d",padding:20,marginBottom:12,borderRadius:16}}>
   <Text style={{color:"white",fontWeight:"800",fontSize:20}}>{r.name}</Text>
   <Text style={{color:"#aaa",marginTop:5}}>{r.personality} · Intensity {r.aggression ?? 65}%</Text>
  </TouchableOpacity>)}
  {!rivals.length&&<Text style={{color:"#888",marginBottom:20}}>No rivals yet. Create your first one.</Text>}</ScrollView>
  <TouchableOpacity onPress={()=>router.push("/rival/create")} style={{backgroundColor:"#E50914",borderRadius:14,padding:18,marginBottom:12}}><Text style={{color:"white",fontWeight:"800",textAlign:"center"}}>+ Create a Rival</Text></TouchableOpacity>
  <TouchableOpacity onPress={()=>router.push("/settings")}><Text style={{color:"#999",textAlign:"center"}}>Settings</Text></TouchableOpacity>
 </View>;
}