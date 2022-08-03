import React, { useEffect, useState } from "react";
import { API, Storage } from "aws-amplify";
import { withAuthenticator, Button } from "@aws-amplify/ui-react";

const Dashboard = ({ user, signOut }) => {
  const [userName, setUserName] = useState("");
  const [tag, setTags] = useState('');
  const [tagsArray, setTagArray] = useState([]);
  const [itemPic, setItemPic] = useState([]);
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState([]);
  //packItems

  useEffect(() => {
    API.get("traxApi", "/items/packItems").then((res) => {
      setData(res);
      console.log("ress of get api data:", res);
    });
  }, []);

  const onSelectFile = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(undefined);
      return;
    }
    const file = e.target.files[0];
    const selectedPic = await Storage.put(file.name, file);
    console.log(
      "🚀 ~ file: Dashboard.js ~ line 49 ~ onSelectFile ~ selectedPic",
      selectedPic
    );
    setSelectedFile(file);
    fetchBucketImages();
  };

  const fetchBucketImages = async () => {
    let imageKeys = await Storage.list("");
    const sortByDate = (arr) => {
      const sorter = (a, b) => {
        return (
          new Date(a.lastModified).getTime() -
          new Date(b.lastModified).getTime()
        );
      };
      arr.sort(sorter);
    };
    sortByDate(imageKeys);
    imageKeys = await Promise.all(
      imageKeys.map(async (v) => {
        const signedUrl = await Storage.get(v.key);
        return signedUrl;
      })
    );
    const img = imageKeys[imageKeys.length - 1];
    setItemPic(itm => itm.concat(img))
  };
  
  // const deleteItem =()=>{
  //   API.del("traxApi", "/items/packItems").then((res)=>{
  //     Storage.remove()
  //     console.log('res del',res);
  //   }).catch((error)=>console.log('error delete api',error))
  // }

  const SubmitProduct = (e) => {
    e.preventDefault();
    API.post("traxApi", "/items", {
      body: {
        name: userName,
        tags: tagsArray,
        itemPic: itemPic,
        productId:'3'
      },
    }).then((res)=>{
      setUserName('')
      setTagArray('')
      setItemPic('')
      setPreview('')
    })
  };
  const AddTags = ()=>{
     if(tag){
      setTagArray(itm=> itm.concat(tag))
      setTags('')
     }
    }

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  return (
    <div style={{ backgroundColor: "green", width: "100%", height: "100%" }}>
      <Button onClick={signOut}>Sign out</Button>
      <h1>Dashboard</h1>
      <form  onSubmit={SubmitProduct}>
        <input
          value={userName}
          placeholder="user-name"
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          value={tag}
          placeholder="product tag"
          onChange={(e) => setTags(e.target.value)}
        />
        <input type={"file"} placeholder="item pic" onChange={onSelectFile} />
        <button type="submit" name="submit">Submit</button>
      </form>
        <button onClick={()=>AddTags()} >add tag</button>
      {tagsArray.length > 0 && tagsArray?.map((val,index)=>{
        return(
          <h5 key={index}>#{val}</h5>
        )
       })}
        {/* <button onClick={()=>deleteItem()} >delete product</button> */}
      {selectedFile && (
        <img src={preview} alt="pic" style={{ width: 400, height: 400 }} />
      )}
      {data.map((v, i) => {
        return (
          <div key={i}>
            <h1>Product Name: {v.name}</h1>
            {v?.tags?.map((tag)=>(
               <h2>Tag: #{tag}</h2>             
            ))}
            {v?.itemPic?.map((image,i) => (
              <img src={image} alt="pic" style={{ width: 400, height: 400 }} key={i}/>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default withAuthenticator(Dashboard);
