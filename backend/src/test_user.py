from util.database import SessionLocal
from model.user_handler import create_user, get_user, update_user_info, delete_user
from datetime import date

def print_menu():
    print("\n" + "="*30)
    print("   [유저 관리 테스트 메뉴]   ")
    print("="*30)
    print("1. 유저 생성 (Create)")
    print("2. 유저 조회 (Read)")
    print("3. 유저 수정 (Update - 전화번호)")
    print("4. 유저 삭제 (Delete)")
    print("0. 테스트 종료")
    print("="*30)

def run_interactive_test():
    db = SessionLocal()
    test_username = "gold_tester" # 테스트용 고정 아이디
    
    while True:
        print_menu()
        choice = input("실행할 단계의 번호를 입력하세요: ")

        try:
            if choice == '1':
                print(f"\n[1단계] '{test_username}' 유저 생성을 시작합니다...")
                new_user = create_user(
                    db=db,
                    username=test_username,
                    password="password123",
                    full_name="골드테스터",
                    email="gold@test.com",
                    birth_date=date(1995, 3, 16),
                    gender="남"
                )
                print(f"✅ 결과: ID {new_user.id}번 유저 생성 완료!")
                print("💡 Tip: DBeaver에서 'users' 테이블을 새로고침(F5) 해보세요.")

            elif choice == '2':
                print(f"\n[2단계] '{test_username}' 유저를 DB에서 조회합니다...")
                user = get_user(db, username=test_username)
                if user:
                    print(f"✅ 결과: 찾았습니다! [이름: {user.full_name}, 이메일: {user.email}]")
                else:
                    print("❌ 결과: 해당 유저가 DB에 없습니다.")

            elif choice == '3':
                print(f"\n[3단계] '{test_username}'의 전화번호를 수정합니다...")
                user = get_user(db, username=test_username)
                if user:
                    update_data = {"phone_number": "010-7777-7777"}
                    updated = update_user_info(db, user_id=user.id, update_data=update_data)
                    print(f"✅ 결과: 번호가 {updated.phone_number}로 변경되었습니다.")
                    print("💡 Tip: DBeaver에서 해당 행의 'phone_number' 컬럼을 확인하세요.")
                else:
                    print("❌ 결과: 수정할 유저가 없습니다. 1번을 먼저 실행하세요.")

            elif choice == '4':
                print(f"\n[4단계] '{test_username}' 유저를 삭제합니다...")
                user = get_user(db, username=test_username)
                if user:
                    if delete_user(db, user_id=user.id):
                        print(f"✅ 결과: '{test_username}' 유저 및 관련 히스토리가 삭제되었습니다.")
                        print("💡 Tip: DBeaver에서 데이터가 사라졌는지 확인하세요.")
                else:
                    print("❌ 결과: 삭제할 유저가 없습니다.")

            elif choice == '0':
                print("👋 테스트를 종료합니다.")
                break
            else:
                print("⚠️ 잘못된 번호입니다. 다시 입력해주세요.")

        except Exception as e:
            print(f"🔥 에러 발생: {e}")
            db.rollback()

    db.close()

if __name__ == "__main__":
    run_interactive_test()