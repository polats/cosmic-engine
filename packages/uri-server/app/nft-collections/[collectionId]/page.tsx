import {getNftsInCollection, getNftCollectionData} from '@/app/lib/actions';
import Link from 'next/link'

interface NftListPageProps {
    params:{
        collectionId: number;
    }
}

export default async function NftListPage(props: NftListPageProps){
    const collection = props.params
    const nftList = await getNftsInCollection(collection.collectionId);
    const nftCollectionData = await getNftCollectionData(collection.collectionId)

    return(
        <div className="p-3">
            <h3 className='text-bold'> Collection: {nftCollectionData?.name} </h3>
            <div className="flex flex-col p-4 gap-4 border rounded">
                {nftList?.map((nft, index) => (
                    <div key={index} className="flex  w-full">
                        <Link
                            key={nft.id}
                            href={`/nft-collections/${collection.collectionId}/${nft.id}`}
                            className="flex  w-full justify-between items-center p-2 border rounded"
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