import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'hidden-courses.json');

async function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  }
}

async function readHiddenCourses(): Promise<number[]> {
  await ensureDataFile();
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeHiddenCourses(courseIds: number[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(courseIds, null, 2));
}

// GET hidden course IDs
export async function GET() {
  try {
    const hiddenCourses = await readHiddenCourses();
    return NextResponse.json(hiddenCourses);
  } catch (error) {
    console.error('Error reading hidden courses:', error);
    return NextResponse.json({ error: 'Failed to read hidden courses' }, { status: 500 });
  }
}

// POST to hide a course
export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json();
    const hiddenCourses = await readHiddenCourses();

    if (!hiddenCourses.includes(courseId)) {
      hiddenCourses.push(courseId);
      await writeHiddenCourses(hiddenCourses);
    }

    return NextResponse.json({ success: true, hiddenCourses });
  } catch (error) {
    console.error('Error hiding course:', error);
    return NextResponse.json({ error: 'Failed to hide course' }, { status: 500 });
  }
}

// DELETE to unhide a course
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = parseInt(searchParams.get('courseId') || '');

    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    const hiddenCourses = await readHiddenCourses();
    const filtered = hiddenCourses.filter(id => id !== courseId);
    await writeHiddenCourses(filtered);

    return NextResponse.json({ success: true, hiddenCourses: filtered });
  } catch (error) {
    console.error('Error unhiding course:', error);
    return NextResponse.json({ error: 'Failed to unhide course' }, { status: 500 });
  }
}
