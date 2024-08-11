const Root = () => {
    return (
        <>
            <div id="sidebar">
                <h1>React router Contacts</h1>
                <div>
                    <form role="search" id="search-form">
                        <input type="search" name="q" id="q" placeholder="search" />
                        <div id="search-spinner" aria-hidden hidden={true}></div>
                        <div className="sr-only" aria-live="polite"></div>
                    </form>
                    <form method="post">
                        <button type="submit">New</button>
                    </form>
                </div>
                <nav>
                    <ul>
                        <li><a href={`/contacts/1`}>Your name</a></li>
                        <li><a href={`/contacts/2`}>Your friend</a></li>
                    </ul>
                </nav>
            </div>
            <div id="detail"></div>
        </>
    );
}

export default Root;