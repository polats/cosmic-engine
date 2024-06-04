'use client';
import { useState, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { addNft, getNftCollectionData } from '@/actions';
import Link from 'next/link'

interface NewNftPageProps {
    params:{
        collectionId: number;
    }
}

export default function NewNft(props: NewNftPageProps) {
    const [nftCollectionData, setNftCollectionData] = useState<any>(null);
    const [formState, action] = useFormState(addNft.bind(null,{id: props.params.collectionId}), { message: '' });


    useEffect(() => {
        const fetchData = async () => {
            const data = await getNftCollectionData(props.params.collectionId);
            setNftCollectionData(data);
        };
        
        fetchData();
    }, []);

    return (
        <div className="flex grow justify-center items-center">
            <form action={action}>
                <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[800px] border rounded px-5 py-10">
                    <h3 className='font-bold mb-[0.8rem]'>Create NFT</h3>
                    <div className="flex gap-4 items-center">
                        <label className="w-[120px]" htmlFor="collection_name">
                            Collection
                        </label>
                        <input
                            name="collection_name"
                            id="collection_name"
                            className="border rounded p-2 w-full"
                            value={nftCollectionData?.name ? nftCollectionData?.name : 'loading...'}
                            disabled={true}
                        />
                    </div>
                    <div className="flex gap-4 items-center">
                        <label className="w-[120px]" htmlFor="name">
                            Name
                        </label>
                        <input
                            name="name"
                            id="name"
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="flex gap-4 items-center">
                        <label className="w-[120px]" htmlFor="description">
                            Description
                        </label>
                        <input
                            name="description"
                            id="description"
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="flex gap-4 items-center">
                        <label className="w-[120px]" htmlFor="image">
                            Image
                        </label>
                        <input
                            name="image"
                            id="image"
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    {
                        formState.message ? <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
                            {formState.message}
                        </div> : null
                    }
                    <div className='flex w-full justify-end pt-2 gap-2'>
                        <Link href={`/nft-collections/${props.params.collectionId}`} className="button px-4 py-2 hover:bg-red-400 hover:rounded-xl hover:border-red-500"> Back</Link>
                        <button className="button border rounded-xl py-2 px-4 ">Save</button>
                    </div>
                </div>
            </form>
        </div>
    )
}