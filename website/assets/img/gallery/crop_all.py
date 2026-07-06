import os
from PIL import Image

def autocrop_and_transparent(img, threshold=245):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    
    # Threshold white/close-to-white pixels to transparent
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
    
    # 1. Left side turnaround, body, actions rows
    # Col x boundaries: [0, 126, 252, 378, 504, 630]
    # Rows y boundaries:
    #   Row 0 (Turnaround): 40 to 260
    #   Row 1 (Full Body): 270 to 480
    #   Row 2 (Actions): 490 to 680
    
    left_x = [0, 126, 252, 378, 504, 630]
    
    # Turnaround
    turnaround_names = [
        "mascot_turn_front.png",
        "mascot_turn_front34.png",
        "mascot_turn_side.png",
        "mascot_turn_back34.png",
        "mascot_turn_back.png"
    ]
    for i, name in enumerate(turnaround_names):
        box = (left_x[i], 40, left_x[i+1], 260)
        cropped = sheet.crop(box)
        processed = autocrop_and_transparent(cropped)
        processed.save(os.path.join(dest_dir, name), "PNG")
        print(f"Saved turnaround: {name}")

    # Full Body
    body_names = [
        "mascot_standing.png",
        "mascot_waving.png",
        "mascot_thumbsup.png",
        "mascot_pointing.png",
        "mascot_presenting.png"
    ]
    for i, name in enumerate(body_names):
        box = (left_x[i], 270, left_x[i+1], 480)
        cropped = sheet.crop(box)
        processed = autocrop_and_transparent(cropped)
        processed.save(os.path.join(dest_dir, name), "PNG")
        print(f"Saved body pose: {name}")
        
        # Overwrite the default codecraft_mascot.png with the new standard standing pose
        if name == "mascot_standing.png":
            processed.save(os.path.join(dest_dir, "codecraft_mascot.png"), "PNG")
            print("Updated default codecraft_mascot.png with mascot_standing.png")

    # Actions
    action_names = [
        "mascot_running.png",
        "mascot_jumping.png",
        "mascot_working.png",
        "mascot_building.png",
        "mascot_reading.png"
    ]
    for i, name in enumerate(action_names):
        box = (left_x[i], 490, left_x[i+1], 680)
        cropped = sheet.crop(box)
        processed = autocrop_and_transparent(cropped)
        processed.save(os.path.join(dest_dir, name), "PNG")
        print(f"Saved action pose: {name}")

    # 2. Right side Expressions
    # Col x boundaries: [630, 761, 892, 1024]
    # Row y boundaries: [40, 186, 332, 480]
    right_x = [630, 761, 892, 1024]
    expr_y = [40, 186, 332, 480]
    
    expr_grid = [
        ["mascot_expr_happy.png", "mascot_expr_excited.png", "mascot_expr_thinking.png"],
        ["mascot_expr_wink.png", "mascot_expr_surprised.png", "mascot_expr_sad.png"],
        ["mascot_expr_confident.png", "mascot_expr_cheerful.png", "mascot_expr_angry.png"]
    ]
    
    for r in range(3):
        for c in range(3):
            name = expr_grid[r][c]
            box = (right_x[c], expr_y[r], right_x[c+1], expr_y[r+1])
            cropped = sheet.crop(box)
            processed = autocrop_and_transparent(cropped)
            processed.save(os.path.join(dest_dir, name), "PNG")
            print(f"Saved expression: {name}")

if __name__ == '__main__':
    main()
