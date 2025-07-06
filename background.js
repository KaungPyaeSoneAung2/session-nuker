chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url.startsWith("http")) return;

    const url = new URL(tab.url);
    const domain = url.hostname;

    // Step 1: Get all cookies for this domain
    const cookies = await chrome.cookies.getAll({ domain });

    // Step 2: Remove all cookies (await all removals)
    await Promise.all(
        cookies.map((cookie) => {
            const cookieUrl =
                (cookie.secure ? "https://" : "http://") +
                cookie.domain +
                cookie.path;
            return chrome.cookies.remove({
                url: cookieUrl,
                name: cookie.name,
            });
        })
    );

    // Step 3: Clear localStorage and sessionStorage
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            localStorage.clear();
            sessionStorage.clear();
            console.log("Cleared localStorage and sessionStorage");
        },
    });

    // Step 4: Reload the tab
    chrome.tabs.reload(tab.id);
});
