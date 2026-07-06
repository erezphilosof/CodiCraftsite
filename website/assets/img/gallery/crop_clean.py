import os
from PIL import Image

def autocrop_and_transparent(img, threshold=245):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    
    # Threshold white pixels to transparent
    for item in datas:
        if item[0] >= threshold and item[1] >= threshold and item[2] >= threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    
    # Autocrop using bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    return img

def main():
    img_path = r"C:\Users\User\.gemini\antigravity\brain\5a5459c3-fb05-45a5-a115-eb79b402b39e\media__1781871230153.jpg"
    dest_dir = r"c:\Users\User\OneDrive\שולחן העבודה\Trading\New folder\brainit-copy\website\assets\img\gallery"
    
    os.makedirs(dest_dir, exist_ok=True)
    sheet = Image.open(img_path)
    
    left_x = [0, 126, 252, 378, 504, 630]
    
    # Refined Turnaround: y=75 to y=230 to exclude turnaround labels at bottom and headers at top
    turnaround_names = [
        "mascot_turn_front.png",
        "mascot_turn_front34.png",
        "mascot_turn_side.png",
        "mascot_turn_back34.png",
        "mascot_turn_back.png"
    ]
    for i, name in enumerate(turnaround_names):
        box = (left_x[i] + 12, 75, left_x[i+1] - 12, 230)
        cropped = sheet.crop(box)
        processed = autocrop_and_transparent(cropped)
        processed.save(os.path.join(dest_dir, name), "PNG")
        print(f"Saved turnaround: {name}")

    # Refined Full Body: y=320 to y=460 to exclude row header "FULL BODY POSES" and label texts
    body_names = [
        "mascot_standing.png",
        "mascot_waving.png",
        "mascot_thumbsup.png",
        "mascot_pointing.png",
        "mascot_presenting.png"
    ]
    for i, name in enumerate(body_names):
        box = (left_x[i] + 12, 320, left_x[i+1] - 12, 460)
        cropped = sheet.crop(box)
        processed = autocrop_and_transparent(cropped)
        processed.save(os.path.join(dest_dir, name), "PNG")
        print(f"Saved body pose: {name}")
        
        # Overwrite the default codecraft_mascot.png with the new clean standing pose
        if name == "mascot_standing.png":
            processed.save(os.path.join(dest_dir, "codecraft_mascot.png"), "PNG")
            print("Updated default codecraft_mascot.png with clean mascot_standing.png")

    # Refined Actions: y=530 to y=665 to exclude row headers and label texts
    action_names = [
        "mascot_running.png",
        "mascot_jumping.png",
        "mascot_working.png",
        "mascot_building.png",
        "mascot_reading.png"
    ]
    for i, name in enumerate(action_names):
        box = (left_x[i] + 12, 530, left_x[i+1] - 12, 665)
        cropped = sheet.crop(box)
        processed = autocrop_and_transparent(cropped)
        processed.save(os.path.join(dest_dir, name), "PNG")
        print(f"Saved action pose: {name}")

    # Refined Expressions to crop only head faces and exclude labels
    right_x = [630, 761, 892, 1024]
    expr_y_starts = [75, 220, 365]
    expr_y_ends = [165, 310, 455]
    
    expr_grid = [
        ["mascot_expr_happy.png", "mascot_expr_excited.png", "mascot_expr_thinking.png"],
        ["mascot_expr_wink.png", "mascot_expr_surprised.png", "mascot_expr_sad.png"],
        ["mascot_expr_confident.png", "mascot_expr_cheerful.png", "mascot_expr_angry.png"]
    ]
    
    for r in range(3):
        for c in range(3):
            name = expr_grid[r][c]
            box = (right_x[c] + 10, expr_y_starts[r], right_x[c+1] - 10, expr_y_ends[r])
            cropped = sheet.crop(box)
            processed = autocrop_and_transparent(cropped)
            processed.save(os.path.join(dest_dir, name), "PNG")
            print(f"Saved expression: {name}")

if __name__ == '__main__':
    main()
