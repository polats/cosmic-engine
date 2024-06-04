import {getNftCollections} from '@/app/lib/actions';
import Link from 'next/link'

export default async function NftListPage(){
    const nftList = await getNftCollections();

    return(
        <div className="p-3">
            <div className="flex justify-between items-center pb-5">
                <div> <h3 className='text-bold'> Got some nfts? </h3> </div>
                <div>
                    <Link
                        href={`/nft-collections/new`}
                        className="flex  w-full justify-between items-center p-2 border rounded-xl hover:bg-[#385183]"
                    >
                        New
                    </Link>
                </div>
            </div>
            <div className="flex flex-col p-4 gap-4 border rounded">
                {nftList.map((nft, index) => (
                    <div key={index} className="flex max-w-[300px] w-full">
                        <Link
                            key={nft.id}
                            href={`/nft-collections/${nft.id}`}
                            className="flex flex-col w-full justify-between items-center p-2 border rounded"
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