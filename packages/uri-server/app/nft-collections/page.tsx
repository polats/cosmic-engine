import {getNftCollections} from '@/actions';
import Link from 'next/link'

export default async function NftListPage(){
    const nftList = await getNftCollections();

    return(
        <div className="flex flex-col grow p-3">
            <div className="flex justify-between items-center mb-5">
                <div> <h3 className='text-bold'> Got some nfts? </h3> </div>
                <div>
                    <Link
                        href={`/nft-collections/new`}
                        className="flex  w-full justify-between items-center py-2 px-4 border rounded-xl hover:bg-[#385183]"
                    >
                        Add Collection
                    </Link>
                </div>
            </div>
            <div className="flex grow p-4 gap-4 border rounded">
                {nftList.map((nft, index) => (
                    <div key={index} className="flex p-2 max-w-[260px] w-full">
                        <Link
                            key={nft.id}
                            href={`/nft-collections/${nft.id}`}
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