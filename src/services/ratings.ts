import { IRateProductQuery } from "../ts/services/ratings.types.ts"
import AxiosJSON from "../utils/helpers/axios.ts"

export async function rateProduct(query : IRateProductQuery){
   try{
     const response = await AxiosJSON.post(`products/${query.id}/ratings`,{rating : query.rating})
     return response
   }catch(error){
       console.log(error)
       return null
   }
}
export async function rateRetailer(query : IRateProductQuery){
   try{
     const response = await AxiosJSON.post(`users/${query.id}/ratings`,{rating : query.rating})
     return response
   }catch(error){
       console.log(error)
       return null
   }
}
