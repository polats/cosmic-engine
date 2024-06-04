import { getNftData } from "@/actions";

interface NftProps {
    params: {
        id: number;
    };
}

export default async function NftPage(props: NftProps){
    const nftData = await getNftData(props.params.id)
    
    return (
        <div className="flex grow w-full p-4">
            <div className="flex border justify-center p-5 rounded w-full">
                <h3 className="font-bold">{nftData?.id}: {nftData?.name}</h3>
            </div>
        </div>
    )
}