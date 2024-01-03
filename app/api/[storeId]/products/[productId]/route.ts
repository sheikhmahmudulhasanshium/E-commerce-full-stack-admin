import prismadb from "@/lib/prismadb"
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

//this will target individual store
//even though the req is not used the params should be in the 2nd argument. 
export async function PATCH(req:Request,{params}:{params: { productId: string, storeId: string }}) {
    try{
        const { userId } = auth();

        const body = await req.json();
    
        const { name, price, categoryId, images, colorId, sizeId, isFeatured, isArchived } = body;
    
        if (!userId) {
          return new NextResponse("Unauthenticated", { status: 403 });
        }
    
        if (!params.productId) {
          return new NextResponse("Product id is required", { status: 400 });
        }
    
        if (!name) {
          return new NextResponse("Name is required", { status: 400 });
        }
    
        if (!images || !images.length) {
          return new NextResponse("Images are required", { status: 400 });
        }
    
        if (!price) {
          return new NextResponse("Price is required", { status: 400 });
        }
    
        if (!categoryId) {
          return new NextResponse("Category id is required", { status: 400 });
        }
    
        if (!colorId) {
          return new NextResponse("Color id is required", { status: 400 });
        }
    
        if (!sizeId) {
          return new NextResponse("Size id is required", { status: 400 });
        }

        //try and fetch the current store
        //check this storeId belongs to this user
        const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
            }
        });

        //user is logged in but does not have permission to update other's product
        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 405 });
          }
          await prismadb.product.update({
            where: {
              id: params.productId
            },
            data: {
              name,
              price,
              categoryId,
              colorId,
              sizeId,
              images: {
                deleteMany: {},
              },
              isFeatured,
              isArchived,
            },
          });
      

          const product = await prismadb.product.update({
            where: {
              id: params.productId
            },
            data: {
              images: {
                createMany: {
                  data: [
                    ...images.map((image: { url: string }) => image),
                  ],
                },
              },
            },
          })
        return NextResponse.json(product)
    }
    catch(error){
        console.log("[PRODUCT_PATCH]",error)
        return new NextResponse("Internal Error",{status:500})
    }
}



//this will target individual store
//even though the req is not used the params should be in the 2nd argument. 
export async function DELETE(req:Request,{params}:{params:{storeId:string,productId:string}}) {
    try{
        const {userId}=auth()
        if(!userId){
            return new NextResponse("Unauthenticated", {status:403})
        }
        
        if(!params.productId){
            return new NextResponse("Product ID is reuired",{status:400})
        }

        //try and fetch the current store
        //check this storeId belongs to this user
        const storeByUserId=await prismadb.store.findFirst({
            where:{
                    id:params.storeId,
                    userId
                }
            }
            )
        //user is logged in but does not have permission to update other's product
            if(!storeByUserId){
                return new NextResponse("Unauthorized", {status:403})
            }

        const product = await prismadb.product.delete({
                where: {
                  id: params.productId
                },
              });
        return NextResponse.json(product)
    }
    catch(error){
        console.log("[PRODUCT_DELETE]",error)
        return new NextResponse("Internal Error",{status:500})
    }
}


export async function GET(req:Request,{params}:{params:{productId:string}}) {
    try{
        
        if(!params.productId){
            return new NextResponse("Product ID is reuired",{status:400})
        }
        const product = await prismadb.product.findUnique({
            where: {
              id: params.productId
            },
            include: {
              images: true,
              category: true,
              size: true,
              color: true,
            }
          });
        return NextResponse.json(product)
    }
    catch(error){
        console.log("[PRODUCT_GET]",error)
        return new NextResponse("Internal Error",{status:500})
    }
}