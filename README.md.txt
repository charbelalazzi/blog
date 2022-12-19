First step: npm i

const res = [
    {
        _id: true,
        content : []
    }
    {
        _id: false,
        content : []
    }
]

const obj = {
    edited: [...],
    unedited: [...]
}
res.foreach(elem => {
    if(elem._id){
        obj.edited = elem.content;
    } else {
        obj.unedited = elem.content;
    }
})