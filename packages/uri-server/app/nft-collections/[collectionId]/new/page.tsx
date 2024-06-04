'use client';

import { useFormState } from 'react-dom';
import { addNft } from '@/app/lib/actions';

export default function NewNft() {
    const [formState, action] = useFormState(addNft, { message: '' });

    return (
        <div className="flex grow justify-center items-center">
            <form action={action}>
                <div className="flex flex-col items-center justify-center gap-4 w-full max-w-[800px] border rounded px-5 py-10">
                    <h3 className='font-bold mb-[0.8rem]'>Create NFT</h3>
                    <div className="flex gap-4">
                        <label className="w-[120px]" htmlFor="name">
                            Name
                        </label>
                        <input
                            name="name"
                            id="name"
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="flex gap-4">
                        <label className="w-[120px]" htmlFor="description">
                            Description
                        </label>
                        <input
                            name="description"
                            id="description"
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="flex gap-4">
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
                    <div className='flex w-full justify-end pt-2'>
                        <button className="button border rounded p-2 ">Save</button>
                    </div>
                </div>
            </form>
        </div>
    )
}