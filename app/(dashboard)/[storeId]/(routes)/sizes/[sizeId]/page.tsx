import prismadb from "@/lib/prismadb";
import { SizeForm } from "./components/size-form";

const SizePage =async ({params}:{params:{sizeId:string}}) => {
    //fetch existing sizes using id
    const size=await prismadb.size.findUnique({
        where:{
            id:params.sizeId
        }
    })

    return ( 
        <div className="flex-col">
            <div className="flex-1 p-8 space-y-4">
                <SizeForm initialData={size}/>
            </div>
        </div>
     );
}
 
export default SizePage;