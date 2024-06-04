import {getNftsInCollection, getNftCollectionData} from '@/actions';
import Link from 'next/link'
import ChevronLeft from '@/public/chevron-left';
interface NftListPageProps {
    params:{
        collectionId: number;
    }
}

export default async function NftListPage(props: NftListPageProps){
    const collection = props.params;
    const nftList = await getNftsInCollection(collection.collectionId);
    const nftCollectionData = await getNftCollectionData(collection.collectionId);

    return(
        <div className="flex flex-col grow p-3">
            <div className="flex justify-between items-center mb-5">
                <div className="flex items-center "> <Link href="/nft-collections"><ChevronLeft className="w-5 h-5 mx-3"/></Link> <h3 className='text-bold p-0 m-0'>  {nftCollectionData?.name} </h3> </div>
                <div>
                    <Link
                        href={`/nft-collections/${collection.collectionId}/new`}
                        className="flex  w-full justify-between items-center py-2 px-4 border rounded-xl hover:bg-[#385183]"
                    >
                        Add NFT
                    </Link>
                </div>
            </div>
            <div className="flex grow p-4 gap-4 border rounded">
                {nftList?.map((nft, index) => (
                    <div key={index} className="flex p-2 max-w-[260px] w-full">
                        <Link
                            key={nft.id}
                            href={`/nft-collections/${collection.collectionId}/${nft.id}`}
                            className="flex flex-col w-full justify-between h-[280px] items-center p-2 border rounded"
                        >
                            <div>{nft.name}</div>
                            <div>View</div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}