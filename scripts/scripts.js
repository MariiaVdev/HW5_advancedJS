const urlUsers = "https://ajax.test-danit.com/api/json/users";
const urlPosts = "https://ajax.test-danit.com/api/json/posts";
const container = document.querySelector(".container");

class Card {
    constructor(name, username, email, title, text, postId, id) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.title = title;
        this.text = text;
        this.postId = postId;
        this.id = id;
        this.container = document.createElement('div');
        this.containerSubmenu = document.createElement('div');
        this.containerBtn = document.createElement('div');
        this.deleteButton = document.createElement('button');
        this.editButton = document.createElement('button');
        this.containerText = document.createElement('div');
    }

    createElements() {
        this.container.className = 'card';
        this.container.insertAdjacentHTML("beforeend", `<div class="card__image">
        <img class="card__photo" src="./img/space.jpg" alt="user photo"></img>
        </div>
        <div class="card__title">
            <p><b>${this.name}</b></p>
            <p>@${this.username}</p>
            <p>${this.email}</p>
        </div>`)

        this.containerSubmenu.className = 'card__btn';
        this.containerSubmenu.innerHTML = '<img src="img/dots.png" alt="dots"></img>';
        this.containerBtn.className = 'card__delBtn';
        this.deleteButton.innerHTML = 'DELETE';
        this.editButton.innerHTML = 'EDIT';
        this.containerBtn.append(this.deleteButton);
        this.containerBtn.append(this.editButton);
        this.containerSubmenu.append(this.containerBtn);
        this.container.append(this.containerSubmenu);

        this.containerText.className = 'card__text';
        this.containerText.innerHTML = `<p><b>${this.title}</b></p>
        <p>${this.text}</p>`
        this.container.append(this.containerText);


        this.containerSubmenu.addEventListener('click', () => {
            this.containerBtn.classList.toggle("visible");
        })
        
        this.containerText.addEventListener('click', () => {
            this.containerBtn.classList.remove("visible");
        })

        this.deleteButton.addEventListener('click', () => {
            fetch(`https://ajax.test-danit.com/api/json/posts/${this.postId}`, {
                method: 'DELETE',
            })
                .then(({ status }) => {
                    if (status === 200) {
                        this.container.remove();
                    }else throw Error;
                })
                .catch(Error => {
                    alert("Something went wrong!  This post is not included in general data. Please, contact to support");
                })
        })

        
        this.editButton.addEventListener('click', () => {
           editCard(this.postId, this.id, this.containerText);
        })


    }

    render(selector) {
        this.createElements();
        selector.prepend(this.container);
    }

}

fetch(urlUsers).then(res => res.json())
    .then(data => {
        const preloader = document.querySelector(".lds-facebook");
        data.forEach(({ id, name, username, email }) => {
            fetch(urlPosts).then(res => res.json())
                .then(data => {
                    data.forEach(({ id: postId, userId, title, body }) => {
                        if (userId === id) {
                            preloader.classList.add("hidden");
                            new Card(name, username, email, title, body, postId, id).render(container);
                        }
                    })
                })
        })
    })


class Modal {
    constructor() {
        this._modalElement = document.createElement('div');
        this._backgroundContainer = document.createElement('div');
        this._mainContainer = document.createElement('div');
        this._contentContainer = document.createElement('div');
        this._buttonContainer = document.createElement('div');
        this._closeButton = document.createElement('div');
    }

    closeModal() {
        this._modalElement.remove();
    }

    createElements() {
        this._closeButton.classList.add('modal__close');
        this._closeButton.addEventListener('click', this.closeModal.bind(this));

        this._backgroundContainer.classList.add('modal__background');
        this._backgroundContainer.addEventListener('click', this.closeModal.bind(this));

        this._contentContainer.classList.add('modal__content-wrapper');
        this._buttonContainer.classList.add('modal__button-wrapper');

        this._mainContainer.classList.add('modal__main-container');
        this._mainContainer.append(this._contentContainer);
        this._mainContainer.append(this._buttonContainer);
        this._mainContainer.append(this._closeButton);

        this._modalElement.classList.add('modal');
        this._modalElement.append(this._backgroundContainer);
        this._modalElement.append(this._mainContainer);
    }

    render(container = document.body) {
        this.createElements();
        container.append(this._modalElement);
    }
}

class AddCardModal extends Modal {
    constructor(input, text, confirmF) {
        super();
        this.form = document.createElement('form')
        this.input = document.createElement('input')
        this.textArea = document.createElement('textarea')
        this.title = input
        this.text = text
        this.confirmBttn = document.createElement('button')
        this.confirmF = confirmF

    }

    createElements() {
        super.createElements()
        this.form.insertAdjacentHTML('beforeend', '<label>Заголовок</label>')
        this.form.append(this.input)
        this.form.insertAdjacentHTML('beforeend', '<label>Текст публікації</label>')
        this.form.append(this.textArea)
        this._contentContainer.append(this.form)
        this._buttonContainer.append(this.confirmBttn)
        this.confirmBttn.innerText = 'Опублікувати';
        this.confirmBttn.classList.add('modal__confirm-btn');

        this.input.value = this.title
        this.textArea.value = this.text

        this.confirmBttn.addEventListener('click', () => {
            this.confirmF(this.input.value, this.textArea.value)
            this.closeModal()
        })

    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


function addPost() {
    const confirmF = (newTitle, newText) => {
        const postId = getRandomInt(101, 300);

        fetch(urlPosts,
            {
                method: 'POST',
                body: JSON.stringify({
                    id: postId,
                    userId: 1,
                    title: `${newTitle}`,
                    body: `${newText}`
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
            .then(({ id: postId, userId, title, body }) => {
                fetch(urlUsers).then(res => res.json())
                    .then(data => {
                        data.forEach(({ id, name, username, email }) => {
                                        if (userId === id) {
                                            new Card(name, username, email, title, body, postId, id).render(container);
                                        }
                                    
                                })
                        })
                    });
    }

    new AddCardModal("", "", confirmF).render()
}

const btnAddPost = document.querySelector('.btn__addPost');
btnAddPost.addEventListener('click', () => {
    addPost();
})


function editCard(postId, id, container) {
    fetch(`https://ajax.test-danit.com/api/json/posts/${postId}`).then(res => res.json())
                .then(({title, body}) => {
                    new AddCardModal(title, body, confirmF).render()
                })
                .catch(err => {
                    alert("Something went wrong!  This post is not included in general data. Please, contact to support");
                })

    const confirmF = (newTitle, newText) => {
        fetch(`https://ajax.test-danit.com/api/json/posts/${postId}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    userId: id,
                    title: `${newTitle}`,
                    body: `${newText}`
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
            .then(({ userId, title, body, id: postId }) => {
                fetch(urlUsers).then(res => res.json())
                    .then(data => {
                        data.forEach(({ id, name, username, email }) => {
                                        if (userId === id) {
                                            container.innerHTML = `<p><b>${title}</b></p>
                                            <p>${body}</p>`
                                        }
                                    
                                })
                        })

                
            })
    }
  
    }