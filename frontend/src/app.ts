class Habit {
    constructor(
        public id: number | undefined,
        public icon: string,
        public name: string,
        public date: string,
        public description?: string
    ) { }

    getDaysSince(): number {
        const currentDate = new Date();
        const habitDate = new Date(this.date);
        return Math.floor((currentDate.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24));
    }
}

class HabitManager {
    private habitListElement: HTMLElement;
    private modal: HTMLElement;
    private closeModalButton: HTMLElement;

    constructor(habitListElementId: string, modalId: string, closeModalButtonId: string) {
        this.habitListElement = document.getElementById(habitListElementId) as HTMLElement;
        this.modal = document.getElementById(modalId) as HTMLElement;
        this.closeModalButton = document.getElementById(closeModalButtonId) as HTMLElement;

        this.displayHabits();
        this.setupEventListeners();
    }

    private setupEventListeners() {
        document.getElementById('add-habit-card')?.addEventListener('click', () => this.showModal());
        this.closeModalButton.addEventListener('click', () => this.hideModal());
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hideModal();
            }
        });

        const form = document.getElementById('habit-form') as HTMLFormElement;
        form.addEventListener('submit', (e) => this.addHabit(e));
    }

    private showModal() {
        this.modal.classList.remove('hidden');
        this.modal.style.display = 'block';
    }

    private hideModal() {
        this.modal.classList.add('hidden');
        this.modal.style.display = 'none';
    }

    private async addHabit(event: Event) {
        event.preventDefault();

        const habitNameInput = document.getElementById('habit-name') as HTMLInputElement;
        const habitDescriptionInput = document.getElementById('habit-description') as HTMLInputElement;
        const habitDateInput = document.getElementById('habit-date') as HTMLInputElement;

        const newHabit = new Habit(undefined, "", habitNameInput.value, habitDateInput.value, habitDescriptionInput.value);

        await fetch('http://localhost:3000/habits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newHabit),
        });

        habitNameInput.value = '';
        habitDescriptionInput.value = '';
        habitDateInput.value = '';
        this.hideModal();
        this.displayHabits();
    }

    private async deleteHabit(id: number) {
        await fetch(`http://localhost:3000/habits/${id}`, {
            method: 'DELETE',
        });
        this.displayHabits();
    }

    private async fetchHabits(): Promise<Habit[]> {
        const response = await fetch('http://localhost:3000/habits');
        const habitsData = await response.json();
        return habitsData.map((habit: any) => new Habit(habit.id, habit.icon, habit.name, habit.date, habit.description));
    }

    async displayHabits() {
        const habits = await this.fetchHabits();
        this.habitListElement.innerHTML = '';

        const addCard = document.createElement('div');
        addCard.className = 'card add-card';
        addCard.innerHTML = '<p><ion-icon name="add-circle-outline"></ion-icon> Add New Habit</p>';
        addCard.addEventListener('click', () => this.showModal());
        this.habitListElement.appendChild(addCard);
        
        habits.forEach(habit => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
            <p><ion-icon name="${habit.icon}"></ion-icon></p>
            <p class="name">${habit.name}</p>
            <p>${habit.description}</p>
            <p>${habit.date}</p>
            <p>Streak: ${habit.getDaysSince()} days</p>
            <button class="delete-btn" data-id="${habit.id}">Delete</button>
        `;
            this.habitListElement.appendChild(card);

            card.querySelector('.delete-btn')?.addEventListener('click', (e) => {
                const id = parseInt((e.target as HTMLButtonElement).getAttribute('data-id')!);
                this.deleteHabit(id);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HabitManager('activities', 'modal', 'close-modal-button');
});
