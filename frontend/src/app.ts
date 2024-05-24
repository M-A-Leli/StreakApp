// Habit interface
interface Habit {
    id: number;
    icon: string;
    name: string;
    date: string;
    description: string;
    getDaysSince: () => number;
}

// Class representing the Streak App
class StreakApp {
    private habits: Habit[] = [];

    constructor() {
        this.fetchHabits(); // Fetch habits from JSON server
        this.setupEventListeners(); // Setup event listeners
    }

    // Fetch habits from JSON server
    private async fetchHabits(): Promise<void> {
        try {
            const response = await fetch('http://localhost:3000/habits');
            if (!response.ok) {
                throw new Error('Failed to fetch habits');
            }
            const habitsData = await response.json();
            if (Array.isArray(habitsData)) {
                this.habits = habitsData.map((habit: any) => ({
                    id: habit.id,
                    icon: habit.icon,
                    name: habit.name,
                    date: habit.date,
                    description: habit.description,
                    getDaysSince: function () {
                        const today = new Date();
                        const start = new Date(this.date);
                        const timeDiff = Math.abs(today.getTime() - start.getTime());
                        return Math.ceil(timeDiff / (1000 * 3600 * 24));
                    }
                }));
                this.renderHabits(); // Render habits after addition
            } else {
                throw new Error('Invalid habits data format');
            }
        } catch (error) {
            console.error('Error fetching habits:', error);
        }
    }


    // Render habits as cards
    private renderHabits(): void {
        const activitiesDiv = document.getElementById('activities') as HTMLDivElement;
        activitiesDiv.innerHTML = ''; // Clear existing cards

        // Create and append "Add New Habit" card
        const addCard = document.createElement('div');
        addCard.className = 'card add-card';
        addCard.id = 'add-habit-card';
        addCard.innerHTML = '<p><ion-icon name="add-circle-outline"></ion-icon> Add New Habit</p>';
        addCard.addEventListener('click', () => this.openModal());
        activitiesDiv.appendChild(addCard);

        this.habits.forEach(habit => {
            const card = this.createHabitCard(habit);
            activitiesDiv.appendChild(card);
        });
    }

    // Create habit card
    private createHabitCard(habit: Habit): HTMLElement {
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

        // Add event listener to delete button
        card.querySelector('.delete-btn')?.addEventListener('click', () => {
            const confirmed = confirm('Are you sure you want to delete this habit?');
            if (confirmed) {
                this.deleteHabit(habit.id)
                    .then(() => {
                        this.renderHabits(); // Render habits after deletion
                    })
                    .catch(error => {
                        console.error('Error deleting habit:', error);
                    });
            }
        });
        return card;
    }

    // Setup event listeners
    private setupEventListeners(): void {
        const addHabitCard = document.getElementById('add-habit-card') as HTMLDivElement;
        addHabitCard.addEventListener('click', () => {
            this.openModal();
        });

        const closeButton = document.querySelector('.close-button') as HTMLButtonElement;
        closeButton.addEventListener('click', () => {
            this.closeModal();
        });

        const habitForm = document.getElementById('habit-form') as HTMLFormElement;
        habitForm.addEventListener('submit', (event: Event) => {
            event.preventDefault();
            this.addHabit();
            this.closeModal();
        });
    }

    // Open modal
    private openModal(): void {
        const modal = document.getElementById('modal') as HTMLDivElement;
        modal.classList.remove('hidden');
    }

    // Close modal
    private closeModal(): void {
        const modal = document.getElementById('modal') as HTMLDivElement;
        modal.classList.add('hidden');
    }

    // Add habit
    private async addHabit(): Promise<void> {
        const habitNameInput = document.getElementById('habit-name') as HTMLInputElement;
        const habitDescriptionInput = document.getElementById('habit-description') as HTMLTextAreaElement;
        const habitDateInput = document.getElementById('habit-date') as HTMLInputElement;

        const newHabit: Habit = {
            id: this.habits.length + 1,
            icon: 'clipboard',
            name: habitNameInput.value,
            description: habitDescriptionInput.value,
            date: habitDateInput.value,
            getDaysSince: () => 0
        };

        try {
            const response = await fetch('http://localhost:3000/habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newHabit),
            });

            if (!response.ok) {
                throw new Error('Failed to add habit');
            }

            const savedHabit = await response.json();
            // Assign the getDaysSince function
            savedHabit.getDaysSince = function () {
                const today = new Date();
                const start = new Date(this.date);
                const timeDiff = Math.abs(today.getTime() - start.getTime());
                return Math.ceil(timeDiff / (1000 * 3600 * 24));
            };
            this.habits.push(savedHabit);
            this.renderHabits();
        } catch (error) {
            console.error('Error adding habit:', error);
        }
    }

    // Delete habit
    private async deleteHabit(id: number): Promise<void> {
        try {
            const response = await fetch(`http://localhost:3000/habits/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete habit');
            }
            this.habits = this.habits.filter(habit => habit.id !== id);
            this.renderHabits();
        } catch (error) {
            console.error('Error deleting habit:', error);
        }
    }
}

// Initialize Streak App
const app = new StreakApp();
