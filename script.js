const memo = document.getElementById("memo");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const memoList = document.getElementById("memoList");

function getMemoList() {
    const savedMemos = localStorage.getItem("memoList");
    if (!savedMemos) {
        return [];
    }

    try {
        return JSON.parse(savedMemos);
    } catch (error) {
        return [];
    }
}

function saveMemoList(memos) {
    localStorage.setItem("memoList", JSON.stringify(memos));
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function renderMemoList() {
    const memos = getMemoList();

    if (memos.length === 0) {
        memoList.innerHTML = '<li class="empty">まだ保存されたメモはありません。</li>';
        return;
    }

    memoList.innerHTML = memos
        .map((item) => `
            <li class="memo-item">
                <div class="memo-header">
                    <div class="memo-date">${escapeHtml(item.dateText)}</div>
                    <button class="delete-btn" data-id="${item.id}" type="button">削除</button>
                </div>
                <div class="memo-content">${escapeHtml(item.text)}</div>
            </li>
        `)
        .join("");
}

function migrateLegacyMemo() {
    const legacyMemo = localStorage.getItem("memoText");
    if (!legacyMemo) {
        return;
    }

    const memos = getMemoList();
    if (memos.length === 0) {
        memos.push({
            id: Date.now(),
            dateText: new Date().toISOString().split("T")[0],
            text: legacyMemo
        });
        saveMemoList(memos);
    }

    localStorage.removeItem("memoText");
}

window.onload = () => {
    migrateLegacyMemo();
    renderMemoList();
};

memoList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-btn");
    if (!deleteButton) {
        return;
    }

    const memoId = Number(deleteButton.dataset.id);
    const memos = getMemoList();
    const targetMemo = memos.find((item) => item.id === memoId);

    if (!targetMemo) {
        return;
    }

    const confirmed = window.confirm("このメモを本当に削除しますか？");
    if (!confirmed) {
        return;
    }

    const updatedMemos = memos.filter((item) => item.id !== memoId);
    saveMemoList(updatedMemos);
    renderMemoList();
});

memo.addEventListener("keydown", (event) => {
    if (event.altKey && event.key === "Enter") {
        event.preventDefault();
        saveBtn.click();
    }
});

saveBtn.onclick = () => {
    const text = memo.value.trim();
    if (!text) {
        alert("メモを入力してください。")
        return;
    }

    const today = new Date();
    const dateText = today.toISOString().split("T")[0]; // YYYY-MM-DD形式
    const memoText = `【${dateText}】\n${text}`;

    const memos = getMemoList();
    memos.unshift({
        id: Date.now(),
        dateText,
        text: memoText
    });

    saveMemoList(memos);
    memo.value = "";
    renderMemoList();
};

clearBtn.onclick = () => {
    localStorage.removeItem("memoList");
    localStorage.removeItem("memoText");
    memo.value = "";
    renderMemoList();
    alert("保存済みメモをすべて削除しました！");
};
