import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { NeedCategory, NeedStatus, SkillType, DayOfWeek } from '../../../types';

export async function GET() {
  try {
    const batch = writeBatch(db);

    // 1. Seed Needs
    const needs = [
      {
        title: "Downtown Water Crisis",
        description: "Main pipe burst affecting 200+ residents in the shelter. Immediate water supply and plumbing repair needed.",
        category: NeedCategory.SAFETY,
        urgencyScore: 9.2,
        location: "123 Main St, Sector 4",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        affectedCount: 200,
        status: NeedStatus.OPEN,
        createdAt: new Date()
      },
      {
        title: "Clinic Oxygen Shortage",
        description: "Local health center running low on oxygen cylinders for critical care patients. Emergency delivery required.",
        category: NeedCategory.MEDICAL,
        urgencyScore: 9.8,
        location: "Central Hospital Wing B",
        coordinates: { lat: 40.7306, lng: -73.9352 },
        affectedCount: 15,
        status: NeedStatus.OPEN,
        createdAt: new Date()
      },
      {
        title: "St. Jude's Food Depletion",
        description: "Community kitchen serves 500 meals daily but supplies will run out in 48 hours. Need dry rations.",
        category: NeedCategory.FOOD,
        urgencyScore: 6.5,
        location: "St. Jude Community Center",
        coordinates: { lat: 40.7589, lng: -73.9851 },
        affectedCount: 500,
        status: NeedStatus.OPEN,
        createdAt: new Date()
      },
      {
        title: "High School Roof Damage",
        description: "Structural collapse of the gymnasium roof during storm. 50 students displaced from temporary housing.",
        category: NeedCategory.HOUSING,
        urgencyScore: 8.7,
        location: "Westside High School",
        coordinates: { lat: 40.7829, lng: -73.9654 },
        affectedCount: 50,
        status: NeedStatus.OPEN,
        createdAt: new Date()
      },
      {
        title: "Rural Literacy Support",
        description: "Local library destroyed; 100 students lack textbooks and stationery for upcoming exams.",
        category: NeedCategory.EDUCATION,
        urgencyScore: 4.2,
        location: "Village Education Hub",
        coordinates: { lat: 40.8075, lng: -73.9466 },
        affectedCount: 100,
        status: NeedStatus.OPEN,
        createdAt: new Date()
      }
    ];

    for (const need of needs) {
      const ref = doc(collection(db, 'needs'));
      batch.set(ref, need);
    }

    // 2. Seed Volunteers
    const volunteers = [
      {
        name: "Dr. Sarah Chen",
        email: "sarah.chen@medical.org",
        phone: "+1-555-0101",
        city: "North District",
        skills: [SkillType.MEDICAL, SkillType.COUNSELLING],
        serviceRadius: 25,
        availability: [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Mark Robinson",
        email: "mark.r@logistics.net",
        phone: "+1-555-0102",
        city: "Central Hub",
        skills: [SkillType.LOGISTICS, SkillType.FOOD_DISTRIBUTION],
        serviceRadius: 50,
        availability: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Elena Rodriguez",
        email: "elena.edu@foundation.org",
        phone: "+1-555-0103",
        city: "West Riverside",
        skills: [SkillType.EDUCATION, SkillType.COUNSELLING],
        serviceRadius: 15,
        availability: [DayOfWeek.TUESDAY, DayOfWeek.THURSDAY],
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "David Smith",
        email: "d.smith@build.com",
        phone: "+1-555-0104",
        city: "Industrial Zone",
        skills: [SkillType.CONSTRUCTION, SkillType.LOGISTICS],
        serviceRadius: 40,
        availability: [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
        isActive: true,
        createdAt: new Date()
      },
      {
        name: "Anita Patel",
        email: "anita.p@response.org",
        phone: "+1-555-0105",
        city: "South Point",
        skills: [SkillType.MEDICAL, SkillType.LOGISTICS],
        serviceRadius: 30,
        availability: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
        isActive: true,
        createdAt: new Date()
      }
    ];

    for (const vol of volunteers) {
      const ref = doc(collection(db, 'volunteers'));
      batch.set(ref, vol);
    }

    await batch.commit();

    return NextResponse.json({ message: "Seeding completed successfully" });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
