import React from 'react';

export default function EditorBody({ textAreaRef, content, handleTextChange }) {
    return (
        <main className="flex-1 overflow-y-auto py-8 px-4 flex justify-center">
            <div className="bg-white shadow-md border border-slate-200 w-full max-w-[816px] min-h-[1056px] p-12 lg:p-24 focus-within:ring-1 focus-within:ring-indigo-100">
                <textarea 
                    ref={textAreaRef}
                    className="w-full h-full min-h-[800px] resize-none border-none focus:outline-none text-slate-800 text-base leading-relaxed"
                    placeholder="Start typing..."
                    value={content}
                    onChange={handleTextChange}
                ></textarea>
            </div>
        </main>
    );
}
