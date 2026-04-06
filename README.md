# 법과목 기출문제 퀴즈

## 파일 구조
```
law-quiz/
├── index.html          ← 사용자용 (퀴즈 화면)
├── admin.html          ← 관리자용 (문제 업로드/관리)
└── data/
    ├── 헌법.json
    ├── 민법.json
    ├── 형법.json
    ├── 상법.json
    ├── 헌법논증이론.json
    └── 글쓰기.json
```

## 관리자 사용법
1. `admin.html` 접속 → 비밀번호 입력 (기본: `admin1234`)
2. Anthropic API 키 입력 후 저장
3. 과목 선택 → 이미지 업로드 or 직접 입력
4. [JSON 내보내기] 탭 → 파일 다운로드
5. 다운받은 JSON을 GitHub `data/` 폴더에 업로드

## GitHub Pages 배포
1. 이 폴더 전체를 GitHub 저장소에 업로드
2. Settings → Pages → Branch: main / root → Save
3. URL: `https://[아이디].github.io/[저장소명]/`

## 비밀번호 변경
`admin.html` 상단의 `const ADMIN_PW = 'admin1234';` 수정
