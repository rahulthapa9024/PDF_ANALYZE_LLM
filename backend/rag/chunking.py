from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(text, chunk_size=300, overlap=50):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    return chunks