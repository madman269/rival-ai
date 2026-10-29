import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { saveRival } from "../src/rivalStorage";
export default function CreateRival() {
 const router=useRouter();const [name,setName]=useState("");const [personality,setPersonality]=useState("competitive");const [description,setDescription]=useState("");const [aggression,setAggression]=useState(50);const [busy,setBusy]=useState(false);const [avatarUri,setAvatarUri]=useState<string|null>(null); const [memoryNotes,setMemoryNotes]=useState(""); const [sliderWidth,setSliderWidth]=useState(1);
 const save=async()=>{if(!name.trim()||busy)return;setBusy(true);try{await saveRival({id:Date.now().toString(36)+Math.random().toString(36).slice(2),name:name.trim(),personality:personality.trim(),description:description.trim(),aggression,avatarUri,memoryNotes:memoryNotes.trim(),createdAt:Date.now()});router.replace("/")}finally{setBusy(false)}};
 const chooseImage = async () => {
  const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) { Alert.alert("Photo access", "Allow photo access to select a rival portrait."); return; }
  const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"],allowsEditing:true,aspect:[1,1],quality:0.8});
  if(!result.canceled && result.assets?.[0]?.uri) setAvatarUri(result.assets[0].uri);
 };
 const adjust=(x:number)=>setAggression(Math.max(0,Math.min(100,Math.round(x/sliderWidth*100))));
 const label={color:"#aaa",marginTop:18,marginBottom:6} as const;
 return <ScrollView style={{flex:1,backgroundColor:"#08080c"}} contentContainerStyle={{padding:24,paddingTop:60,paddingBottom:48}}>
  <Text style={{color:"#E50914",fontWeight:"800"}}>NEW RIVAL</Text><Text style={{color:"white",fontSize:30,fontWeight:"800",marginTop:8}}>Create your competition</Text>
  <TouchableOpacity onPress={chooseImage} style={{alignSelf:"center",marginTop:22,alignItems:"center"}}>
   {avatarUri?<Image source={{uri:avatarUri}} style={{width:110,height:110,borderRadius:55}}/>:<View style={{width:110,height:110,borderRadius:55,backgroundColor:"#24242c",alignItems:"center",justifyContent:"center"}}><Text style={{color:"white",fontSize:35}}>+</Text></View>}
   <Text style={{color:"#aaa",marginTop:8}}>Choose profile picture</Text>
  </TouchableOpacity>
  <Text style={label}>Name</Text><TextInput value={name} onChangeText={setName} maxLength={60} placeholder="Kai" placeholderTextColor="#666" style={{backgroundColor:"#1a1a20",color:"white",padding:16,borderRadius:12}}/>
  <Text style={label}>Personality</Text><TextInput value={personality} onChangeText={setPersonality} maxLength={60} placeholder="Confident, sarcastic..." placeholderTextColor="#666" style={{backgroundColor:"#1a1a20",color:"white",padding:16,borderRadius:12}}/>
  <Text style={label}>Character backstory and behavior</Text><TextInput multiline value={description} onChangeText={setDescription} maxLength={1000} placeholder="Describe who this rival is..." placeholderTextColor="#666" style={{backgroundColor:"#1a1a20",color:"white",padding:16,borderRadius:12,minHeight:100,textAlignVertical:"top"}}/>
  <Text style={label}>Aggression · {aggression}%</Text>
  <View onLayout={e=>setSliderWidth(Math.max(1,e.nativeEvent.layout.width))}
    onStartShouldSetResponder={()=>true} onMoveShouldSetResponder={()=>true}
    onResponderGrant={e=>adjust(e.nativeEvent.locationX)}
    onResponderMove={e=>adjust(e.nativeEvent.locationX)}
    style={{height:40,justifyContent:"center"}}>
    <View style={{backgroundColor:"#3b3b44",height:8,borderRadius:10,overflow:"hidden"}}><View style={{width:aggression+"%",backgroundColor:"#E50914",height:8}}/></View>
    <View pointerEvents="none" style={{position:"absolute",left:aggression+"%",marginLeft:-11,width:22,height:22,borderRadius:11,backgroundColor:"white"}}/>
  </View>
  <Text style={{color:"#888"}}>{aggression<30?"Friendly":aggression<70?"Competitive":"Intense"} · Adjust by dragging</Text>
  <Text style={label}>What should this rival remember about you?</Text>
  <TextInput multiline value={memoryNotes} onChangeText={setMemoryNotes} maxLength={1000} placeholder="Your goals, interests, ongoing competition..." placeholderTextColor="#666" style={{backgroundColor:"#1a1a20",color:"white",padding:16,borderRadius:12,minHeight:88,textAlignVertical:"top"}}/>
  <TouchableOpacity disabled={busy||!name.trim()} onPress={save} style={{backgroundColor:"#E50914",padding:18,borderRadius:12,marginTop:30,opacity:busy||!name.trim()?.5:1}}><Text style={{color:"white",fontWeight:"800",textAlign:"center"}}>Create Rival</Text></TouchableOpacity>
 </ScrollView>;
}