function translateColorToTamil(colorName) {
    if (!colorName) return '-';
    
    // 1. புள்ளிகள் (..), கமா மற்றும் கூடுதல் ஸ்பேஸ்களை முழுமையாக நீக்குகிறது
    var cleanName = String(colorName).replace(/[.,]/g, '').replace(/\s+/g, ' ').trim();
    var c = cleanName.toLowerCase();

    // 📌 சுத்தப்படுத்தப்பட்ட மேப்பிங் அகராதி (Cleaned Dictionary)
    var map = {
        'red': 'ரெட்',
        'grey': 'கிரே',
        'gray': 'கிரே',
        'l grey': 'L. கிரே',
        'l gray': 'L. கிரே',
        'd grey': 'D. கிரே',
        'd gray': 'D. கிரே',
        'khaki': 'காக்கி',
        'l khaki': 'L. காக்கி',
        'd khaki': 'D. காக்கி',
        'cream': 'கிரீம்',
        'navy': 'நேவி',
        'green': 'கிரீன்',
        'l green': 'L. கிரீன்',
        'd green': 'D. கிரீன்',
        'white': 'வெள்ளை',
        'black': 'கருப்பு',
        'blue': 'ப்ளூ',
        'yellow': 'மஞ்சள்',
        '1/2 salavai': '1/2 சலவை',
        '1/2 white': '1/2 சலவை',
        't salavai': 'T. சலவை',
        't white': 'T. சலவை',
        'brown': 'பிரவுன்',
        'rose': 'ரோஸ்',
        'orange': 'ஆரஞ்சு',
        'violet': 'வைலட்',
        'pink': 'பிங்க்',
        'maroon': 'மெரூன்',
        'olive': 'ஆலிவ்',
        'l olive': 'L. ஆலிவ்',
        'd olive': 'D. ஆலிவ்',
        'purple': 'பர்புள்',
        'beige': 'பேஜ்',
        'silver': 'சில்வர்',
        'peach': 'பீச்'
        'Mint': 'மிண்ட்'
    };

    if (map[c]) return map[c];

    // Fallback: ஒருவேளை அகராதியில் இல்லாத புதிய வார்த்தை வந்தால் தனித்தனியாக மாற்றும்
    let translated = cleanName;
    translated = translated.replace(/^l\b/i, 'L. ')
                           .replace(/^d\b/i, 'D. ')
                           .replace(/^t\b/i, 'T. ');

    let colorMap = {
        'grey': 'கிரே', 'gray': 'கிரே', 'red': 'ரெட்', 'green': 'கிரீன்',
        'blue': 'ப்ளூ', 'navy': 'நேவி', 'cream': 'கிரீம்', 'salavai': 'சலவை',
        'khaki': 'காக்கி','Mint': 'மிண்ட்'
    };

    for (let key in colorMap) {
        let regex = new RegExp('\\b' + key + '\\b', 'gi');
        translated = translated.replace(regex, colorMap[key]);
    }

    return translated;
}
