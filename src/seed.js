import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";

const robots = [
  { id: "arduino_basix", name: "Arduino Basix Car", voteCount: 0 },
  { id: "fire_fighting", name: "Fire Fighting Robot Car", voteCount: 0 },
  { id: "food_serving", name: "Food Serving Robot", voteCount: 0 },
  { id: "floor_cleaner", name: "Floor Cleaner Car", voteCount: 0 },
  { id: "water_cleaner", name: "Water Cleaner Boat", voteCount: 0 },
  { id: "high_beam", name: "High Beam Car", voteCount: 0 },
  { id: "smart_dustbin", name: "Smart Dustbin", voteCount: 0 },
  { id: "otto_bot", name: "Otto Bot", voteCount: 0 },
  { id: "home_automation", name: "Home Automation System", voteCount: 0 },
  { id: "water_level", name: "Water Level Indicator System", voteCount: 0 }
];

export async function seedDatabase() {
  try {
    for (const robot of robots) {
      await setDoc(doc(db, "projects", robot.id), {
        name: robot.name,
        voteCount: robot.voteCount
      });
      console.log(`Added: ${robot.name}`);
    }
    
    // Create the global app state document
    await setDoc(doc(db, "settings", "app_state"), {
      status: "waiting"
    });
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding:", error);
  }
}