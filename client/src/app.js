let getData = (e)=>{
    e.preventDefault()
    console.log(e.target.elements.url.value)
    console.log(e.target.elements.size.value)
}

let tmp = (
    <div>
        <form onSubmit={getData}>
            <label>URL: </label>
            <input name="url"></input> 
            <br/>
            <br/>
            <label>Size: </label>
            <input name="size"></input>
            <br/>
            <br/>
            <button>Submit</button>
        </form>
    </div>
)

let app = document.getElementById('app');
ReactDOM.render(tmp,app)
