import React, { createContext, useMemo, useState } from "react";

interface Snippet {
    code: string | null,
    name: string
}

interface SnippetState {
    snippetsNames: string[],
    selectedSnippet: Snippet | null
    addSnippetName: (name: string) => void,
    setSnippetNames: (names: string[]) => void
    setSelectedSnippet: (snippet: Snippet | null) => void
    removeSnippetName: (name: string) => void
}

const FileContext = createContext<SnippetState>({
    snippetsNames: [],
    selectedSnippet: null,
    addSnippetName: name => {},
    setSnippetNames: names => {},
    setSelectedSnippet: snippet => {},
    removeSnippetName: name => {}
});

const FileProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [snippetsNames, setSnippetNames] = useState<string[]>([]);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const providerMethods: SnippetState = useMemo(() => {
        return {
            snippetsNames,
            selectedSnippet,
            addSnippetName: name => setSnippetNames(state => [...state, name]),
            setSnippetNames: names => setSnippetNames(names),
            setSelectedSnippet: snippet => setSelectedSnippet(snippet),
            removeSnippetName: name => setSnippetNames(state => state.filter(n => n !== name))
        };
    }, [snippetsNames, selectedSnippet]);

    return (
        <FileContext.Provider value={providerMethods}>
            {children}
        </FileContext.Provider>
    );
}


// creacion de consumer // legacy mode not recommeded use useContext
const FileConsumer: React.FC<{ callback: (value: SnippetState) => JSX.Element }> = props => {
    return (
        <FileContext.Consumer>
            {props.callback}
        </FileContext.Consumer>
    );
};

export {FileProvider, FileContext};

