

/**
 * 深度复制
 */
 const copyObj = (obj={}) =>{
  let newObj = null;

  if( typeof obj === 'object' && obj !== null ){
    newObj = obj instanceof Array ? [] : {};

    for(let i in obj) {
      newObj[i] = copyObj(obj[i]);
    }
  }else{
    newObj = obj;
  }

  return newObj
 };

 export default copyObj;